require("dotenv").config();
const mongoose = require("mongoose");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "eduverse_rag";
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const buildText = (type, doc) => {
  switch (type) {
    case "course":
      return `Course: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Price: ${doc.price ?? "N/A"}. Status: ${
        doc.status || "N/A"
      }. Instructor: ${
        doc.main_instructor_name || doc.main_instructor || "N/A"
      }.`;
    case "category":
      return `Category: ${doc.name || "Untitled"}. Description: ${
        doc.description || ""
      }.`;
    case "module":
      return `Module: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Course: ${doc.course_title || doc.courseId || "N/A"}. Order: ${
        doc.order ?? "N/A"
      }.`;
    case "lesson":
      return `Lesson: ${doc.title || "Untitled"}. Content: ${
        doc.content || ""
      }. Module: ${doc.module_title || doc.moduleId || "N/A"}. Course: ${
        doc.course_title || doc.courseId || "N/A"
      }. Order: ${doc.order ?? "N/A"}.`;
    case "material":
      return `Material: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Type: ${doc.type || "N/A"}. URL: ${doc.url || "N/A"}. Course: ${
        doc.course_title || doc.courseId || "N/A"
      }.`;
    case "quiz": {
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
      return `Review for Course ${
        doc.course_title || doc.courseId || "N/A"
      } by ${doc.user_name || doc.userId || "N/A"}. Rating: ${
        doc.rating ?? "N/A"
      }. Comment: ${doc.comment || ""}.`;
    case "enrollment":
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
  console.log("Start syncing multiple collections to ChromaDB...");

  if (!MONGO_URI) {
    console.error("MISSING MONGO_URI in .env");
    process.exit(1);
  }
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set. Embeddings may fail.");
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      // Removed deprecated options useNewUrlParser/useUnifiedTopology
    });
    console.log("Connected to MongoDB.");
  } catch (e) {
    console.error("MongoDB connection error:", e.message || e);
    process.exit(1);
  }

  // Minimal model definitions (strict:false) so we can query arbitrary existing collections
  const makeModel = (name) =>
    mongoose.models[name] ||
    mongoose.model(
      name,
      new mongoose.Schema(
        {},
        { strict: false, collection: name.toLowerCase() + "s" }
      )
    );

  const Course = makeModel("Course");
  const Category = makeModel("Category");
  const Module = makeModel("Module");
  const Lesson = makeModel("Lesson");
  const Material = makeModel("Material");
  const Quiz = makeModel("Quiz");
  const Review = makeModel("Review");
  const Enrollment = makeModel("Enrollment");
  const User = makeModel("User"); // optional, if users collection exists

  const fetchCollection = async (model, filter = {}) => {
    try {
      return await model.find(filter).lean().exec();
    } catch (err) {
      console.error(
        `Failed to fetch ${model.collection.name}:`,
        err.message || err
      );
      return [];
    }
  };

  // Fetch all collections first
  const [
    courses,
    categories,
    modules,
    lessons,
    materials,
    quizzes,
    reviews,
    enrollments,
    users,
  ] = await Promise.all([
    fetchCollection(Course, {}), // you may filter by status if desired
    fetchCollection(Category),
    fetchCollection(Module),
    fetchCollection(Lesson),
    fetchCollection(Material),
    fetchCollection(Quiz),
    fetchCollection(Review),
    fetchCollection(Enrollment),
    fetchCollection(User).catch(() => []),
  ]);

  console.log(
    `Fetched - courses:${courses.length}, categories:${categories.length}, modules:${modules.length}, lessons:${lessons.length}, materials:${materials.length}, quizzes:${quizzes.length}, reviews:${reviews.length}, enrollments:${enrollments.length}, users:${users.length}`
  );

  // Build lookup maps for denormalization
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  const moduleMap = new Map(modules.map((m) => [String(m._id), m]));
  const lessonMap = new Map(lessons.map((l) => [String(l._id), l]));
  const categoryMap = new Map(categories.map((c) => [String(c._id), c]));
  const userMap = new Map((users || []).map((u) => [String(u._id), u]));

  const documents = [];

  // Courses
  courses.forEach((c) => {
    const doc = {
      ...c,
      main_instructor_name:
        (c.main_instructor && userMap.get(String(c.main_instructor))?.name) ||
        undefined,
    };
    documents.push({
      pageContent: buildText("course", doc),
      metadata: {
        id: c._id ? String(c._id) : undefined,
        type: "course",
        title: c.title || "",
      },
    });

    // Composite: course summary with its modules and top lessons
    const relatedModules = modules.filter(
      (m) => m.courseId && String(m.courseId) === String(c._id)
    );
    const moduleTitles = relatedModules.map((m) => m.title || "").slice(0, 10);
    const composite = `Course Overview: ${c.title || "Untitled"}. Modules: ${
      moduleTitles.length ? moduleTitles.join(", ") : "None"
    }.`;
    documents.push({
      pageContent: composite,
      metadata: {
        id: c._id ? `${String(c._id)}_overview` : undefined,
        type: "course_overview",
        title: c.title || "",
      },
    });
  });

  // Categories
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

  // Modules (denormalize course title)
  modules.forEach((m) => {
    const course = m.courseId ? courseMap.get(String(m.courseId)) : null;
    const doc = { ...m, course_title: course?.title };
    documents.push({
      pageContent: buildText("module", doc),
      metadata: {
        id: m._id ? String(m._id) : undefined,
        type: "module",
        title: m.title || "",
        courseId: m.courseId ? String(m.courseId) : undefined,
      },
    });
  });

  // Lessons (denormalize module and course titles)
  lessons.forEach((l) => {
    const module = l.moduleId ? moduleMap.get(String(l.moduleId)) : null;
    const course =
      module && module.courseId
        ? courseMap.get(String(module.courseId))
        : l.courseId
        ? courseMap.get(String(l.courseId))
        : null;
    const doc = {
      ...l,
      module_title: module?.title,
      course_title: course?.title,
    };
    documents.push({
      pageContent: buildText("lesson", doc),
      metadata: {
        id: l._id ? String(l._id) : undefined,
        type: "lesson",
        title: l.title || "",
        moduleId: l.moduleId ? String(l.moduleId) : undefined,
        courseId:
          module && module.courseId
            ? String(module.courseId)
            : l.courseId
            ? String(l.courseId)
            : undefined,
      },
    });
  });

  // Materials (denormalize course title if available)
  materials.forEach((m) => {
    const course = m.courseId ? courseMap.get(String(m.courseId)) : null;
    const doc = { ...m, course_title: course?.title };
    documents.push({
      pageContent: buildText("material", doc),
      metadata: {
        id: m._id ? String(m._id) : undefined,
        type: "material",
        title: m.title || "",
        courseId: m.courseId ? String(m.courseId) : undefined,
      },
    });
  });

  // Quizzes (attach lesson/module/course titles where available)
  quizzes.forEach((q) => {
    const doc = { ...q };
    if (q.lessonId) {
      const lesson = lessonMap.get(String(q.lessonId));
      doc.lesson_title = lesson?.title;
      if (lesson && lesson.moduleId) {
        const mod = moduleMap.get(String(lesson.moduleId));
        doc.module_title = mod?.title;
        if (mod && mod.courseId) {
          const course = courseMap.get(String(mod.courseId));
          doc.course_title = course?.title;
        }
      }
    } else if (q.moduleId) {
      const mod = moduleMap.get(String(q.moduleId));
      doc.module_title = mod?.title;
      if (mod && mod.courseId) {
        const course = courseMap.get(String(mod.courseId));
        doc.course_title = course?.title;
      }
    } else if (q.courseId) {
      const course = courseMap.get(String(q.courseId));
      doc.course_title = course?.title;
    }

    documents.push({
      pageContent: buildText("quiz", doc),
      metadata: {
        id: q._id ? String(q._id) : undefined,
        type: "quiz",
        title: q.title || "",
        lessonId: q.lessonId ? String(q.lessonId) : undefined,
        moduleId: q.moduleId ? String(q.moduleId) : undefined,
        courseId: q.courseId ? String(q.courseId) : undefined,
      },
    });
  });

  // Reviews (include course title and optional user name)
  reviews.forEach((r) => {
    const course = r.courseId ? courseMap.get(String(r.courseId)) : null;
    const user = r.userId ? userMap.get(String(r.userId)) : null;
    const doc = { ...r, course_title: course?.title, user_name: user?.name };
    documents.push({
      pageContent: buildText("review", doc),
      metadata: {
        id: r._id ? String(r._id) : undefined,
        type: "review",
        courseId: r.courseId ? String(r.courseId) : undefined,
        userId: r.userId ? String(r.userId) : undefined,
        rating: r.rating,
      },
    });
  });

  // Enrollments (include course title and optional user name)
  enrollments.forEach((en) => {
    const course = en.courseId ? courseMap.get(String(en.courseId)) : null;
    const user = en.userId ? userMap.get(String(en.userId)) : null;
    const doc = { ...en, course_title: course?.title, user_name: user?.name };
    documents.push({
      pageContent: buildText("enrollment", doc),
      metadata: {
        id: en._id ? String(en._id) : undefined,
        type: "enrollment",
        courseId: en.courseId ? String(en.courseId) : undefined,
        userId: en.userId ? String(en.userId) : undefined,
      },
    });
  });

  if (documents.length === 0) {
    console.log("No documents collected. Exiting.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Total documents to index: ${documents.length}`);

  // embeddings and Chroma upload
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GEMINI_API_KEY,
      model: "text-embedding-004",
    });

    // Parse CHROMA_URL to provide host/port/ssl (avoid deprecated 'path')
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

    // Create low-level client with host/port/ssl
    const client = new ChromaClient(chromaClientConfig);

    // delete existing collection if present
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
    } catch (e) {
      console.log(
        "No existing collection to delete or delete failed, will create new."
      );
    }

    const dummyEmbeddingFunction = {
      generate: async (texts) => {
        console.warn(
          "Dummy embedding function 'generate' called. This should not happen if embeddings are provided."
        );
        // Trả về một mảng rỗng cho mỗi văn bản
        return texts.map(() => []);
      },
    };

    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { "hnsw:space": "cosine" }, // Giữ lại metadata từ lần trước
      embeddingFunction: dummyEmbeddingFunction, // <-- THÊM DÒNG NÀY
    });
    console.log(`Ensured collection exists: ${COLLECTION_NAME}`);

    // split into batches
    const BATCH_SIZE = 50; // reduce to avoid rate limits
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      console.log(
        `Indexing batch ${i / BATCH_SIZE + 1} (${batch.length} docs)...`
      );

      // ---- BẮT ĐẦU: tạo embeddings thủ công và dùng client.add() ----
      const batchTexts = batch.map((doc) => doc.pageContent);
      const batchMetadatas = batch.map((doc) => doc.metadata);
      const batchIds = batch.map(
        (doc, j) => doc.metadata?.id || `doc_${i + j}`
      );

      // Tạo embeddings cho batch này
      const batchEmbeddings = await embeddings.embedDocuments(batchTexts);

      // Gọi API cấp thấp của Chroma để thêm dữ liệu (đã cung cấp embeddings)
      await collection.add({
        // <--- SỬA DÒNG NÀY
        // collectionName không cần thiết khi gọi trực tiếp trên collection
        ids: batchIds,
        embeddings: batchEmbeddings,
        metadatas: batchMetadatas,
        documents: batchTexts,
      });
      // ---- KẾT THÚC ----

      // small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Indexing finished.");
  } catch (err) {
    console.error("Chroma / Embeddings error:", err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected MongoDB.");
  }
};

syncData();
