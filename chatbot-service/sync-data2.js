// thainhhe/eduverse/EduVerse-thainh/chatbot-service/sync-data.js
// PHIÊN BẢN CẬP NHẬT - GỌI QUA API BACKEND

require("dotenv").config();
// LOẠI BỎ: const mongoose = require("mongoose");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const axios = require("axios"); // <-- THÊM MỚI
const fs = require("fs");
const path = require("path");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "eduverse_rag";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- BIẾN MỚI TỪ .env ---
const BACKEND_API_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// LOẠI BỎ: const MONGO_URI = process.env.MONGO_URI;

/**
 * Hàm buildText giữ nguyên, không thay đổi.
 * Nó được thiết kế để nhận các đối tượng JSON đã được làm giàu
 * (denormalized) mà API back-end của chúng ta hiện đang cung cấp.
 */
const buildText = (type, doc) => {
  switch (type) {
    case "course":
      // Thêm duration và main_instructor_name hiển thị rõ ràng
      const durationStr =
        doc.duration && typeof doc.duration === "object"
          ? `${doc.duration.value ?? ""} ${doc.duration.unit ?? ""}`.trim()
          : doc.duration || "N/A";
      return `Course: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Price: ${doc.price ?? "N/A"}. Status: ${
        doc.status || "N/A"
      }. Instructor: ${
        doc.main_instructor_name || doc.main_instructor || "N/A"
      }. Duration: ${durationStr}.`;
    case "category":
      return `Category: ${doc.name || "Untitled"}. Description: ${
        doc.description || ""
      }.`;
    case "module":
      // 'doc' từ API đã chứa course_title và course_price
      return `Module: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Course: ${doc.course_title || doc.courseId || "N/A"} (Price: ${
        doc.course_price ?? "N/A"
      }). Order: ${doc.order ?? "N/A"}.`;
    case "lesson":
      // 'doc' từ API đã chứa module_title, course_title, course_price
      return `Lesson: ${doc.title || "Untitled"}. Content: ${
        doc.content || ""
      }. Module: ${doc.module_title || doc.moduleId || "N/A"}. Course: ${
        doc.course_title || doc.courseId || "N/A"
      } (Price: ${doc.course_price ?? "N/A"}). Order: ${doc.order ?? "N/A"}.`;
    case "material":
      // 'doc' từ API đã chứa course_title
      return `Material: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Type: ${doc.type || "N/A"}. URL: ${doc.url || "N/A"}. Course: ${
        doc.course_title || doc.courseId || "N/A"
      }.`;
    case "quiz": {
      // 'doc' từ API đã chứa lesson_title, module_title, course_title, course_price
      const questionsText = Array.isArray(doc.questions)
        ? doc.questions
            .map(
              (q, i) =>
                `Q${i + 1}: ${q.questionText || ""}. Options: ${
                  Array.isArray(q.options) ? q.options.join(", ") : ""
                }.`
            )
            .join(" ")
        : "";
      const parent = doc.lesson_title
        ? `Lesson: ${doc.lesson_title}`
        : doc.module_title
        ? `Module: ${doc.module_title}`
        : doc.course_title
        ? `Course: ${doc.course_title}`
        : "";
      return `Quiz: ${doc.title || "Untitled"}. ${
        doc.description || ""
      }. ${parent}. ${questionsText}`;
    }
    case "review":
      // 'doc' từ API đã chứa course_title, user_name, course_price
      return `Review for Course ${
        doc.course_title || doc.courseId || "N/A"
      } by ${doc.user_name || doc.userId || "N/A"}. Rating: ${
        doc.rating ?? "N/A"
      }. Comment: ${doc.comment || ""}.`;
    case "enrollment":
      // 'doc' từ API đã chứa course_title, user_name, course_price
      return `Enrollment: User ${
        doc.user_name || doc.userId || "N/A"
      } enrolled in Course ${
        doc.course_title || doc.courseId || "N/A"
      }. Status: ${doc.status || "N/A"}. Progress: ${doc.progress ?? "N/A"}.`;
    default:
      return JSON.stringify(doc);
  }
};

const syncData = async () => {
  console.log("Start syncing from BACKEND API to ChromaDB..."); // <-- Log đã cập nhật

  // --- KIỂM TRA BIẾN MÔI TRƯỜNG MỚI ---
  if (!BACKEND_API_URL) {
    console.error("MISSING BACKEND_API_URL in .env");
    process.exit(1);
  }
  if (!INTERNAL_API_KEY) {
    console.error("MISSING INTERNAL_API_KEY in .env. Cannot authenticate.");
    process.exit(1);
  }
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set. Embeddings may fail.");
  }

  // --- LOẠI BỎ: Kết nối Mongoose ---
  // try { await mongoose.connect(...) } catch (e) { ... }

  // --- LOẠI BỎ: Các hàm makeModel, fetchCollection ---

  let apiData;

  // --- THAY THẾ: Gọi API back-end để lấy dữ liệu ---
  try {
    console.log(`Fetching data from ${BACKEND_API_URL}/rag/sync-data ...`);
    const response = await axios.get(`${BACKEND_API_URL}/rag/sync-data`, {
      headers: {
        "x-internal-api-key": INTERNAL_API_KEY, // Gửi key bí mật
      },
    });

    // Giả sử back-end trả về theo cấu trúc: { success: true, message: "...", data: { ... } }
    if (response.data && response.data.success && response.data.data) {
      apiData = response.data.data; // Đây là đối tượng { courses: [], categories: [], ... }
    } else {
      throw new Error("Invalid API response structure from backend.");
    }

    console.log(
      `Fetched from API - courses:${apiData.courses?.length || 0}, categories:${
        apiData.categories?.length || 0
      }, modules:${apiData.modules?.length || 0}, ...`
    );
  } catch (e) {
    console.error(
      "Backend API call error:",
      e.response ? e.response.data : e.message || e
    );
    process.exit(1);
  }

  // --- LOẠI BỎ: `Promise.all` và `fetchCollection` ---

  // --- THAY THẾ: Lấy dữ liệu trực tiếp từ `apiData` ---
  const {
    courses = [],
    categories = [],
    modules = [],
    lessons = [],
    materials = [],
    quizzes = [],
    reviews = [],
    enrollments = [],
  } = apiData;

  console.log(
    `Processing - courses:${courses.length}, categories:${categories.length}, modules:${modules.length}, lessons:${lessons.length}, materials:${materials.length}, quizzes:${quizzes.length}, reviews:${reviews.length}, enrollments:${enrollments.length}`
  );

  // --- LOẠI BỎ: Toàn bộ `Map` (courseMap, moduleMap, ...) ---

  const documents = [];

  // Courses (Giữ nguyên logic này)
  courses.forEach((c) => {
    console.log(
      `Course ${c._id} "${c.title || "Untitled"}" price:`,
      c.price === undefined ? "undefined" : c.price === null ? "null" : c.price
    );

    documents.push({
      pageContent: buildText("course", c),
      metadata: {
        id: c._id ? String(c._id) : undefined,
        type: "course",
        title: c.title || "",
        price: c.price != null ? c.price : null,
      },
    });

    // Composite (Giữ nguyên logic này, vì 'modules' là danh sách đã được xử lý)
    const relatedModules = modules.filter(
      (m) => m.courseId && String(m.courseId) === String(c._id)
    );
    const moduleTitles = relatedModules.map((m) => m.title || "").slice(0, 10);
    const composite = `Course Overview: ${
      c.title || "Untitled"
    }. Description: ${c.description || ""}. Price: ${
      c.price ?? "N/A"
    }. Status: ${c.status || "N/A"}. Modules: ${
      moduleTitles.length ? moduleTitles.join(", ") : "None"
    }.`;
    documents.push({
      pageContent: composite,
      metadata: {
        id: c._id ? `${String(c._id)}_overview` : undefined,
        type: "course_overview",
        title: c.title || "",
        price: c.price != null ? c.price : null,
      },
    });
  });

  // Categories (Giữ nguyên logic)
  categories.forEach((cat) => {
    documents.push({
      pageContent: buildText("category", cat),
      metadata: {
        id: cat._id ? String(cat._id) : undefined,
        type: "category",
        name: cat.name || "",
      },
    });
  });

  // --- Modules (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  modules.forEach((m) => {
    // KHÔNG CẦN tra cứu courseMap nữa.
    // 'm' từ API đã chứa course_title và course_price.
    const doc = m;
    documents.push({
      pageContent: buildText("module", doc),
      metadata: {
        id: m._id ? String(m._id) : undefined,
        type: "module",
        title: m.title || "",
        courseId: m.courseId ? String(m.courseId) : undefined,
        course_price: m.course_price ?? null, // Lấy trực tiếp từ 'm'
      },
    });
  });

  // --- Lessons (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  lessons.forEach((l) => {
    // KHÔNG CẦN tra cứu moduleMap hay courseMap.
    // 'l' từ API đã chứa module_title, course_title, course_price
    // và (giả định) cả courseId đã được giải quyết.
    const doc = l;
    documents.push({
      pageContent: buildText("lesson", doc),
      metadata: {
        id: l._id ? String(l._id) : undefined,
        type: "lesson",
        title: l.title || "",
        moduleId: l.moduleId ? String(l.moduleId) : undefined,
        courseId: l.courseId ? String(l.courseId) : undefined, // API cung cấp
        course_price: l.course_price ?? null, // API cung cấp
      },
    });
  });

  // --- Materials (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  materials.forEach((m) => {
    // 'm' từ API đã chứa course_title, course_price
    const doc = m;
    documents.push({
      pageContent: buildText("material", doc),
      metadata: {
        id: m._id ? String(m._id) : undefined,
        type: "material",
        title: m.title || "",
        courseId: m.courseId ? String(m.courseId) : undefined,
        course_price: m.course_price ?? null, // API cung cấp
      },
    });
  });

  // --- Quizzes (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  quizzes.forEach((q) => {
    // 'q' từ API đã được làm giàu hoàn toàn
    const doc = q;
    documents.push({
      pageContent: buildText("quiz", doc),
      metadata: {
        id: q._id ? String(q._id) : undefined,
        type: "quiz",
        title: q.title || "",
        lessonId: q.lessonId ? String(q.lessonId) : undefined,
        moduleId: q.moduleId ? String(q.moduleId) : undefined,
        courseId: q.courseId ? String(q.courseId) : undefined, // API cung cấp
        course_price: q.course_price ?? null, // API cung cấp
      },
    });
  });

  // --- Reviews (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  reviews.forEach((r) => {
    // 'r' từ API đã chứa course_title, user_name, course_price
    const doc = r;
    documents.push({
      pageContent: buildText("review", doc),
      metadata: {
        id: r._id ? String(r._id) : undefined,
        type: "review",
        courseId: r.courseId ? String(r.courseId) : undefined,
        userId: r.userId ? String(r.userId) : undefined,
        rating: r.rating,
        course_price: r.course_price ?? null, // API cung cấp
      },
    });
  });

  // --- Enrollments (LOGIC ĐÃ ĐƠN GIẢN HÓA) ---
  enrollments.forEach((en) => {
    // 'en' từ API đã chứa course_title, user_name, course_price
    const doc = en;
    documents.push({
      pageContent: buildText("enrollment", doc),
      metadata: {
        id: en._id ? String(en._id) : undefined,
        type: "enrollment",
        courseId: en.courseId ? String(en.courseId) : undefined,
        userId: en.userId ? String(en.userId) : undefined,
        course_price: en.course_price ?? null, // API cung cấp
      },
    });
  });

  // --- Phần Summary (Giữ nguyên) ---
  const allCourseTitlesAndPrices = courses
    .map((c) => {
      const durationStr =
        c.duration && typeof c.duration === "object"
          ? `${c.duration.value ?? ""} ${c.duration.unit ?? ""}`.trim()
          : c.duration || "N/A";
      return `${c.title || "Untitled"} (Giá: ${c.price ?? "N/A"}; Giảng viên: ${
        c.main_instructor_name || "N/A"
      }; Duration: ${durationStr})`;
    })
    .join(", ");

  const summaryDoc = {
    pageContent: `Đây là danh sách tóm tắt tất cả các khóa học hiện có: ${allCourseTitlesAndPrices}. Tổng cộng có ${courses.length} khóa học.`,
    metadata: {
      id: "all_courses_summary_list",
      type: "course_summary_list",
    },
  };
  documents.push(summaryDoc);
  console.log("Added 1 summary document for all courses.");

  // --- NEW: Write summary to local cache file so server can read it directly ---
  try {
    const outPath = path.join(__dirname, "summary.json");
    fs.writeFileSync(outPath, JSON.stringify(summaryDoc, null, 2), "utf8");
    console.log(
      "Wrote summary.json for server-side summary retrieval:",
      outPath
    );
  } catch (e) {
    console.warn("Failed to write summary.json:", e?.message || e);
  }

  // --- Kiểm tra (Giữ nguyên) ---
  if (documents.length === 0) {
    console.log("No documents collected from API. Exiting.");
    // LOẠI BỎ: await mongoose.disconnect();
    return;
  }

  console.log(`Total documents to index: ${documents.length}`);

  // --- PHẦN EMBEDDINGS VÀ CHROMA UPLOAD (GIỮ NGUYÊN) ---
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GEMINI_API_KEY,
      model: "models/text-embedding-004",
    });

    let chromaClientConfig;
    try {
      const u = new URL(CHROMA_URL);
      chromaClientConfig = {
        host: u.hostname,
        port: u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 8000,
        ssl: u.protocol === "https:",
      };
    } catch (e) {
      chromaClientConfig = { host: "localhost", port: 8000, ssl: false };
    }

    const client = new ChromaClient(chromaClientConfig);

    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
    } catch (e) {
      console.log(
        "No existing collection to delete or delete failed, will create new."
      );
    }

    const vectorStore = new Chroma(embeddings, {
      collectionName: COLLECTION_NAME,
      client,
    });

    console.log(
      `Initialized LangChain vector store for collection: ${COLLECTION_NAME}`
    );

    const BATCH_SIZE = 50;
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      console.log(
        `Indexing batch ${i / BATCH_SIZE + 1} (${batch.length} docs)...`
      );

      const batchIds = batch.map(
        (doc, j) => doc.metadata?.id || `doc_${i + j}`
      );

      const cleanBatch = batch.map((doc) => {
        const newMeta = { ...doc.metadata };
        delete newMeta.id;
        return {
          pageContent: doc.pageContent,
          metadata: newMeta,
        };
      });

      await vectorStore.addDocuments(cleanBatch, { ids: batchIds });

      console.log(`Batch ${i / BATCH_SIZE + 1} indexed.`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Indexing finished.");
  } catch (err) {
    console.error("Chroma / Embeddings error:", err.message || err);
    if (err.stack) {
      console.error(err.stack);
    }
  } finally {
    // --- LOẠI BỎ: ngắt kết nối mongoose ---
    // await mongoose.disconnect();
    // console.log("Disconnected MongoDB.");
    console.log("Sync script finished.");
  }
};

syncData();
