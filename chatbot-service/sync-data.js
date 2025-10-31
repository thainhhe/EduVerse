require("dotenv").config();
const mongoose = require("mongoose");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const path = require("path");
const fs = require("fs");

// --- CẤU HÌNH ĐƯỜNG DẪN ---
const COURSE_MODEL_PATH = path.resolve(
  __dirname,
  "../back-end/src/models/Course.js"
);
const USER_MODEL_PATH = path.resolve(
  __dirname,
  "../back-end/src/models/User.js"
);

// --- BIẾN MÔI TRƯỜNG ---
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMA_URL = "http://localhost:8000";
const COLLECTION_NAME = "eduverse_rag";

const syncData = async () => {
  console.log("Bắt đầu quá trình đồng bộ...");

  if (!MONGO_URI) {
    console.error(
      "MISSING MONGO_URI trong .env. Vui lòng kiểm tra chatbot-service/.env (hoặc copy từ back-end/.env)."
    );
    process.exit(1);
  }

  // Hiển thị thông tin rút gọn để debug
  try {
    const display = MONGO_URI.replace(/(\/\/)(.*@)?/, "$1***@");
    console.log("Kết nối tới MongoDB (rút gọn):", display);
  } catch {}

  // 1. Kết nối DB chính (Mongo) — tăng timeout và options
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      // useNewUrlParser/useUnifiedTopology vẫn an toàn để đặt (mặc dù mongoose mới có mặc định)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối MongoDB.");
  } catch (e) {
    console.error("Lỗi kết nối MongoDB:", e.message || e);
    console.error(
      "Kiểm tra: MongoDB có đang chạy (mongod), port 27017, MONGO_URI đúng?"
    );
    return;
  }

  // Require models SAU khi đã kết nối (tránh vấn đề register model trước connect)
  // Thay vì require model từ back-end (gây ra nhiều bản mongoose), định nghĩa model tối giản tại đây
  // Điều quan trọng: đặt collection chính xác (thường là 'courses' nếu model tên 'Course')
  const courseSchema = new mongoose.Schema(
    {
      title: String,
      description: String,
      price: mongoose.Schema.Types.Mixed,
      status: String,
      // nếu cần trường instructor hoặc khác, thêm vào ở đây (loại Mixed/ObjectId tuỳ dữ liệu)
    },
    { collection: "courses", strict: false } // strict:false để không lỗi nếu DB có nhiều field khác
  );
  // Nếu model đã được register trên THIS mongoose instance thì tái sử dụng
  const Course =
    mongoose.models.Course || mongoose.model("Course", courseSchema);

  // 2. Lấy dữ liệu khóa học (bắt lỗi rõ)
  let courses;
  try {
    courses = await Course.find({ status: "approve" }).lean();
    console.log(`Tìm thấy ${courses.length} khóa học đã duyệt.`);
  } catch (err) {
    console.error("Lỗi khi truy vấn Course.find():", err.message || err);
    await mongoose.disconnect();
    return;
  }

  if (!courses || courses.length === 0) {
    console.log("Không có khóa học nào để đồng bộ.");
    await mongoose.disconnect();
    return;
  }

  // 3. Lấy modules + lessons và tạo documents chi tiết hơn
  const moduleSchema = new mongoose.Schema(
    {},
    { collection: "modules", strict: false }
  );
  const lessonSchema = new mongoose.Schema(
    {},
    { collection: "lessons", strict: false }
  );

  const Module =
    mongoose.models.Module || mongoose.model("Module", moduleSchema);
  const Lesson =
    mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

  let modules = [];
  let lessons = [];
  try {
    const courseIds = courses.map((c) => c._id);
    modules = await Module.find({ courseId: { $in: courseIds } }).lean();
    const moduleIds = modules.map((m) => m._id);
    lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).lean();
    console.log(
      `Tìm thấy ${modules.length} module và ${lessons.length} lesson liên quan.`
    );
  } catch (e) {
    console.warn("Không lấy được modules/lessons:", e?.message || e);
  }

  // Map để dễ truy xuất
  const modulesByCourse = {};
  modules.forEach((m) => {
    const cid = String(m.courseId);
    modulesByCourse[cid] = modulesByCourse[cid] || [];
    modulesByCourse[cid].push(m);
  });

  const lessonsByModule = {};
  lessons.forEach((l) => {
    const mid = String(l.moduleId);
    lessonsByModule[mid] = lessonsByModule[mid] || [];
    lessonsByModule[mid].push(l);
  });

  // Tạo documents ở 3 mức: course, module, lesson
  const courseDocuments = [];
  const moduleDocuments = [];
  const lessonDocuments = [];

  courses.forEach((course) => {
    const cid = String(course._id);
    const mods = modulesByCourse[cid] || [];
    const moduleSummaries = mods.map((m) => {
      const mid = String(m._id);
      return {
        id: mid,
        title: m.title || m.name || null,
        lessonCount: (lessonsByModule[mid] || []).length,
      };
    });
    const totalLessons = moduleSummaries.reduce(
      (s, x) => s + (x.lessonCount || 0),
      0
    );

    // Course-level doc (bao gồm summary)
    courseDocuments.push({
      pageContent: `Tên khóa học: ${course.title}. Mô tả: ${
        course.description || ""
      }. Giá: ${course.price || ""} VNĐ. Số module: ${
        mods.length
      }. Số bài học: ${totalLessons}. Modules: ${moduleSummaries
        .map((m) => `${m.title}(${m.lessonCount} bài)`)
        .join("; ")}`,
      metadata: {
        courseId: cid,
        type: "course",
        title: course.title,
        moduleCount: mods.length,
        lessonCount: totalLessons,
        modules: moduleSummaries,
      },
    });

    // Module-level docs
    mods.forEach((m) => {
      const mid = String(m._id);
      const lessonsForM = lessonsByModule[mid] || [];
      moduleDocuments.push({
        pageContent: `Module: ${m.title || m.name}. Mô tả: ${
          m.description || ""
        }. Thuộc khóa học: ${course.title}. Số bài học: ${lessonsForM.length}.`,
        metadata: {
          courseId: cid,
          moduleId: mid,
          type: "module",
          title: m.title || m.name,
          lessonCount: lessonsForM.length,
        },
      });

      lessonsForM.forEach((l) => {
        lessonDocuments.push({
          pageContent: `Bài học: ${l.title || l.name}. Nội dung tóm tắt: ${
            l.summary || l.content || ""
          }. Thuộc module: ${m.title || m.name} - khóa: ${course.title}.`,
          metadata: {
            courseId: cid,
            moduleId: mid,
            lessonId: String(l._id),
            type: "lesson",
            title: l.title || l.name,
          },
        });
      });
    });
  });

  const allDocs = [...courseDocuments, ...moduleDocuments, ...lessonDocuments];

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  const sanitizeMetadata = (meta = {}) => {
    const out = {};
    Object.keys(meta || {}).forEach((k) => {
      const v = meta[k];
      const t = typeof v;
      if (v === null || t === "string" || t === "number" || t === "boolean") {
        out[k] = v;
      } else {
        try {
          out[k] = JSON.stringify(v);
        } catch (e) {
          out[k] = String(v);
        }
      }
    });
    return out;
  };

  const docsForChroma = allDocs.map((d, idx) => ({
    pageContent: d.pageContent,
    metadata: sanitizeMetadata(d.metadata),
    id: `doc-${idx}-${Date.now()}`,
  }));

  const client = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false,
  });

  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`Đã xóa collection cũ: ${COLLECTION_NAME}`);
  } catch (e) {
    console.log("Không tìm thấy collection cũ, tạo mới.");
  }

  console.log("Bắt đầu nạp dữ liệu (courses/modules/lessons) vào ChromaDB...");
  await Chroma.fromDocuments(docsForChroma, embeddings, {
    collectionName: COLLECTION_NAME,
    client,
  });

  console.log(
    `ĐÃ NẠP THÀNH CÔNG: courses ${courses.length}, modules ${modules.length}, lessons ${lessons.length} vào Vector DB!`
  );
  await mongoose.disconnect();
  console.log("Đã ngắt kết nối MongoDB.");
};

syncData();
