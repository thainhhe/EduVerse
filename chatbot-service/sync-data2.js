// thainhhe/eduverse/EduVerse-thainh/chatbot-service/sync-data.js
// PHIÊN BẢN CẬP NHẬT - GỌI QUA API BACKEND

require("dotenv").config();
const { ChromaClient } = require("chromadb");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "eduverse_rag";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// batch size for embedding/upsert
const BATCH_SIZE = Number(process.env.SYNC_BATCH_SIZE) || 128;

const buildText = (type, doc) => {
  switch (type) {
    case "course": {
      const durationStr =
        doc.duration && typeof doc.duration === "object"
          ? `${doc.duration.value ?? ""} ${doc.duration.unit ?? ""}`.trim()
          : doc.duration || "N/A";
      const instrSubjects =
        doc.main_instructor_subject &&
        Array.isArray(doc.main_instructor_subject)
          ? doc.main_instructor_subject.join(", ")
          : doc.main_instructor_subject || "N/A";
      return `Course: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Price: ${doc.price ?? "N/A"}. Status: ${
        doc.status || "N/A"
      }. Instructor: ${
        doc.main_instructor_name || doc.main_instructor || "N/A"
      } (${
        doc.main_instructor_job_title || "N/A"
      }). Subjects: ${instrSubjects}. Duration: ${durationStr}.`;
    }
    case "category":
      return `Category: ${doc.name || "Untitled"}. Description: ${
        doc.description || ""
      }.`;
    case "module":
      return `Module: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Course: ${doc.course_title || doc.courseId || "N/A"} (Price: ${
        doc.course_price ?? "N/A"
      }). Instructor: ${doc.course_main_instructor_name || "N/A"} (${
        doc.course_main_instructor_job_title || "N/A"
      } - ${doc.course_main_instructor_subject || "N/A"}). Order: ${
        doc.order ?? "N/A"
      }.`;
    case "lesson":
      return `Lesson: ${doc.title || "Untitled"}. Content: ${
        doc.content || ""
      }. Module: ${doc.module_title || doc.moduleId || "N/A"}. Course: ${
        doc.course_title || doc.courseId || "N/A"
      } (Price: ${doc.course_price ?? "N/A"}). Instructor: ${
        doc.course_main_instructor_name || "N/A"
      } (${doc.course_main_instructor_job_title || "N/A"} - ${
        doc.course_main_instructor_subject || "N/A"
      }). Order: ${doc.order ?? "N/A"}.`;
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
      }. Comment: ${doc.comment || doc.content || ""}.`;
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

// --------- Prevent concurrent runs ----------
let isSyncing = false;

// helpers to init chroma & embeddings
const parseChromaUrl = (urlStr) => {
  try {
    const u = new URL(urlStr);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 8000,
      ssl: u.protocol === "https:",
    };
  } catch (e) {
    return { host: "localhost", port: 8000, ssl: false };
  }
};

const initClients = async () => {
  const { host, port, ssl } = parseChromaUrl(CHROMA_URL);
  const chromaClient = new ChromaClient({ host, port, ssl });
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_API_KEY,
    model: "models/text-embedding-004",
  });

  // FIX: Sử dụng getOrCreateCollection để đảm bảo collection luôn tồn tại
  // trước khi tiến hành upsert.
  const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: { name: "all-MiniLM-L6-v2" },
  });

  return {
    chromaClient,
    collection,
    embeddings,
  };
};

const pushDocumentsToChroma = async (apiData) => {
  // Backend returns an object with keys exactly:
  // { courses, categories, modules, lessons, materials, quizzes, reviews, enrollments }
  const types = [
    { key: "courses", type: "course" },
    { key: "categories", type: "category" },
    { key: "modules", type: "module" },
    { key: "lessons", type: "lesson" },
    { key: "materials", type: "material" },
    { key: "quizzes", type: "quiz" },
    { key: "reviews", type: "review" },
    { key: "enrollments", type: "enrollment" },
  ];

  const ids = [];
  const docs = [];
  const metas = [];

  for (const t of types) {
    const arr = Array.isArray(apiData[t.key]) ? apiData[t.key] : [];
    for (const d of arr) {
      // backend uses Mongo _id; require it to create stable id
      const origId = d._id ?? d.id;
      if (!origId) {
        // skip malformed doc
        console.warn(`[Sync] skipping ${t.type} without _id`);
        continue;
      }
      const id = `${t.type}_${String(origId)}`;
      ids.push(id);
      docs.push(buildText(t.type, d));
      metas.push({
        type: t.type,
        originalId: String(origId),
        title: d.title || d.name || "",
      });
    }
  }

  if (ids.length === 0) {
    console.log("[Sync] No documents to push to Chroma.");
    return;
  }

  const { collection, embeddings } = await initClients();
  if (!collection) {
    console.error("[Sync] Chroma collection unavailable. Abort push.");
    return;
  }

  // batch upload with embeddings
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunkIds = ids.slice(i, i + BATCH_SIZE);
    const chunkDocs = docs.slice(i, i + BATCH_SIZE);
    const chunkMetas = metas.slice(i, i + BATCH_SIZE);

    try {
      // create embeddings via Google Generative AI
      const vectors = await embeddings.embedDocuments(chunkDocs);
      await collection.upsert({
        ids: chunkIds,
        documents: chunkDocs,
        metadatas: chunkMetas,
        embeddings: vectors,
      });
      console.log(
        `[Sync] Upserted ${chunkIds.length} docs to Chroma (batch ${Math.floor(
          i / BATCH_SIZE
        )})`
      );
    } catch (err) {
      console.error(
        "[Sync] Failed to upsert batch to Chroma:",
        err?.message || err
      );
      // optional: implement retry/backoff here
    }
  }
};

// Exportable function to call from server/CLI
async function runSync() {
  if (isSyncing) {
    console.warn("[Sync] Previous sync is still running. Skipping this run.");
    return;
  }
  isSyncing = true;
  console.log("Start syncing from BACKEND API to ChromaDB...");

  // Basic env checks
  if (!BACKEND_API_URL) {
    console.error("MISSING BACKEND_API_URL in .env");
    isSyncing = false;
    return;
  }
  if (!INTERNAL_API_KEY) {
    console.error("MISSING INTERNAL_API_KEY in .env. Cannot authenticate.");
    isSyncing = false;
    return;
  }
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set. Embeddings may fail.");
  }

  try {
    let apiData;
    try {
      console.log(`Fetching data from ${BACKEND_API_URL}/rag/sync-data ...`);
      const response = await axios.get(`${BACKEND_API_URL}/rag/sync-data`, {
        headers: {
          "x-internal-api-key": INTERNAL_API_KEY,
        },
        timeout: 120000,
      });

      // Backend response util returns { success, message, data }
      if (response.data && response.data.success && response.data.data) {
        apiData = response.data.data;
      } else if (response.data && response.data.data) {
        // tolerate non-success wrapper (defensive)
        apiData = response.data.data;
      } else {
        throw new Error("Invalid API response structure from backend.");
      }

      console.log(
        `Fetched from API - courses:${
          apiData.courses?.length || 0
        }, categories:${apiData.categories?.length || 0}, modules:${
          apiData.modules?.length || 0
        }`
      );
    } catch (e) {
      console.error(
        "Backend API call error:",
        e.response ? e.response.data : e.message || e
      );
      return;
    }

    // Push documents into Chroma (embeddings + upsert)
    try {
      await pushDocumentsToChroma(apiData);
    } catch (err) {
      console.error(
        "[Sync] pushDocumentsToChroma failed:",
        err?.message || err
      );
    }

    // Generate/update summary.json (same fields backend provides)
    if (apiData && Array.isArray(apiData.courses)) {
      try {
        console.log("[Sync] Generating new summary.json...");

        const summaryLines = apiData.courses.map((c) => {
          const instr = c.main_instructor_name || "N/A";
          const price = c.price ?? "N/A";
          const durationStr =
            c.duration && typeof c.duration === "object"
              ? `${c.duration.value ?? ""} ${c.duration.unit ?? ""}`.trim()
              : c.duration || "N/A";
          return `${
            c.title || "Untitled"
          } (Giá: ${price}; GV: ${instr}; Thời lượng: ${durationStr})`;
        });

        const summaryText = `Đây là danh sách tóm tắt tất cả các khóa học hiện có: ${summaryLines.join(
          ", "
        )}. Tổng cộng có ${apiData.courses.length} khóa học.`;

        const summaryDoc = {
          pageContent: summaryText,
          metadata: {
            id: "all_courses_summary_list",
            type: "course_summary_list",
            updatedAt: new Date().toISOString(),
          },
        };

        const summaryPath = path.join(__dirname, "summary.json");
        fs.writeFileSync(
          summaryPath,
          JSON.stringify(summaryDoc, null, 2),
          "utf8"
        );

        console.log(
          `[Sync] Updated summary.json with ${apiData.courses.length} courses.`
        );
      } catch (err) {
        console.error("[Sync] Failed to update summary.json:", err);
      }
    }
  } catch (err) {
    console.error("Sync run failed:", err?.message || err);
  } finally {
    isSyncing = false;
    console.log("Sync run finished.");
  }
}

module.exports = { runSync, buildText };
