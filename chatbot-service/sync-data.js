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

  // 3. Tạo văn bản (Documents) cho Langchain
  const courseDocuments = courses.map((course) => {
    const text = `Tên khóa học: ${course.title}. Mô tả: ${course.description}. Giá: ${course.price} VNĐ.`;
    return {
      pageContent: text,
      metadata: {
        courseId: course._id.toString(),
        type: "course",
        title: course.title,
      },
    };
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  const client = new ChromaClient({ path: CHROMA_URL });

  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`Đã xóa collection cũ: ${COLLECTION_NAME}`);
  } catch (e) {
    console.log("Không tìm thấy collection cũ, tạo mới.");
  }

  console.log("Bắt đầu nạp dữ liệu vào ChromaDB...");
  await Chroma.fromDocuments(courseDocuments, embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });

  console.log(`ĐÃ NẠP THÀNH CÔNG ${courses.length} khóa học vào Vector DB!`);
  await mongoose.disconnect();
  console.log("Đã ngắt kết nối MongoDB.");
};

syncData();
