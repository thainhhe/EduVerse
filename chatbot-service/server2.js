// chatbot-service/server.js (ĐÃ NÂNG CẤP LÊN MULTI-QUERY)
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { ChromaClient } = require("chromadb");
const gg = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT_AI || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMA_URL = "http://localhost:8000";
const COLLECTION_NAME = "eduverse_rag";

const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = gg;
const { runSync } = require("./sync-data2"); // Import runSync để trigger đồng bộ từ endpoint

// 1. Khởi tạo Model và Embeddings (Không đổi)
const model = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  model: "models/gemini-2.5-pro",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "models/text-embedding-004",
});

// 2. Khởi tạo VectorStore (Không đổi)
const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });
const vectorStore = new Chroma(embeddings, {
  collectionName: COLLECTION_NAME,
  client,
});

console.log(
  "[Chatbot] using model:",
  "models/gemini-2.5-pro",
  " embeddings:",
  "models/text-embedding-004"
);

// 3. Khởi tạo 2 BỘ TRUY XUẤT (Retriever)
console.log("[Chatbot] Initializing retrievers...");

// Retriever CHÍNH: Lấy 15 tài liệu bất kỳ
const generalRetriever = vectorStore.asRetriever(15);

// Retriever TÓM TẮT: thay vì truyền filter (gây lỗi ở một số phiên bản),
// ta sẽ lấy trực tiếp document tóm tắt theo ID từ ChromaClient.
const SUMMARY_DOC_ID = "all_courses_summary_list";
const SUMMARY_FILE = path.join(__dirname, "summary.json");

const summaryRetriever = {
  // Langchain code checks for getRelevantDocuments or invoke
  getRelevantDocuments: async () => {
    try {
      // 1) Nếu summary.json tồn tại => trả trực tiếp
      if (fs.existsSync(SUMMARY_FILE)) {
        const raw = fs.readFileSync(SUMMARY_FILE, "utf8");
        const data = JSON.parse(raw);
        return [
          {
            pageContent: data.pageContent,
            metadata: data.metadata || {
              id: SUMMARY_DOC_ID,
              type: "course_summary_list",
            },
          },
        ];
      }

      // 2) Nếu không có file, fallback: tìm trong generalRetriever và lọc theo metadata.type
      if (typeof generalRetriever.getRelevantDocuments === "function") {
        const candidates = await generalRetriever.getRelevantDocuments(
          "tổng quan các khóa học"
        );
        const filtered = (candidates || []).filter(
          (d) => d.metadata && d.metadata.type === "course_summary_list"
        );
        if (filtered.length) return filtered;
      }

      // 3) Cuối cùng: trả rỗng
      return [];
    } catch (e) {
      console.warn("[Chatbot] summaryRetriever failed:", e?.message || e);
      return [];
    }
  },
  // optional invoke alias
  invoke: async (...args) => {
    return summaryRetriever.getRelevantDocuments(...args);
  },
};

console.log("[Chatbot] General and Summary retrievers are active.");

// 4. TỐI ƯU: Định nghĩa các chain xử lý chính
const formatDocs = (docs) => docs.map((doc) => doc.pageContent).join("\n\n");

// --- Chain RAG (Khi tìm thấy tài liệu) ---
const ragPromptTemplate = PromptTemplate.fromTemplate(
  `Bạn là trợ lý AI. Dưới đây là các trích xuất từ nội dung kho tư liệu:\n\n{context}\n\nCâu hỏi:\n{question}\n\nHãy trả lời bằng tiếng Việt, có dẫn nguồn ngắn (nếu có).`
);

const coreRagChain = RunnableSequence.from([
  ragPromptTemplate,
  model,
  new StringOutputParser(),
]);

// --- Chain Fallback (Khi KHÔNG tìm thấy tài liệu) ---
const fallbackPrompt = PromptTemplate.fromTemplate(
  `Bạn là trợ lý AI thân thiện của EduVerse. Trả lời ngắn gọn, bằng tiếng Việt.\n\nCâu hỏi:\n{question}\n\nCâu trả lời:`
);

const fallbackChain = RunnableSequence.from([
  fallbackPrompt,
  model,
  new StringOutputParser(),
]);

// 5. TỐI ƯU: Endpoint /query
app.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    console.log(`[Chatbot Service] Nhận câu hỏi: ${message}`);

    let docs = [];
    const lowerCaseMessage = (message || "").toLowerCase();

    // Mở rộng nhận diện "course intent" (thêm các từ khóa về ngành, lĩnh vực)
    const courseKeywords = [
      "khóa học",
      "khóa",
      "dạy",
      "học",
      "courses",
      "công nghệ thông tin",
      "it",
      "lập trình",
      "programming",
    ];
    const isCourseIntent = courseKeywords.some((kw) =>
      lowerCaseMessage.includes(kw)
    );

    if (isCourseIntent) {
      console.log(
        "[Chatbot] Course intent detected -> combining SUMMARY + GENERAL retrievers."
      );

      // 1) Always try to get the summary doc (fast, from file)
      let summaryDocs = [];
      try {
        summaryDocs = await summaryRetriever.getRelevantDocuments(message);
      } catch (e) {
        console.warn("[Chatbot] summaryRetriever error:", e?.message || e);
        summaryDocs = [];
      }

      // 2) Also get general documents (to include course-specific docs if any)
      let generalDocs = [];
      try {
        if (typeof generalRetriever.getRelevantDocuments === "function") {
          generalDocs = await generalRetriever.getRelevantDocuments(message);
        } else if (typeof generalRetriever.invoke === "function") {
          generalDocs = await generalRetriever.invoke(message);
        } else {
          generalDocs = [];
        }
      } catch (e) {
        console.warn("[Chatbot] generalRetriever error:", e?.message || e);
        generalDocs = [];
      }

      // 3) Combine, dedupe by pageContent (keep summary first)
      const seen = new Set();
      docs = [];
      (summaryDocs || []).forEach((d) => {
        const key = (d.pageContent || "").slice(0, 200);
        if (!seen.has(key)) {
          seen.add(key);
          docs.push(d);
        }
      });
      (generalDocs || []).forEach((d) => {
        const key = (d.pageContent || "").slice(0, 200);
        if (!seen.has(key)) {
          seen.add(key);
          docs.push(d);
        }
      });

      console.log(`[Chatbot] Combined docs count: ${docs.length}`);
    } else {
      // Non-course queries: use general retriever only
      console.log("[Chatbot] Using GENERAL retriever.");
      try {
        if (typeof generalRetriever.getRelevantDocuments === "function") {
          docs = await generalRetriever.getRelevantDocuments(message);
        } else if (typeof generalRetriever.invoke === "function") {
          docs = await generalRetriever.invoke(message);
        } else {
          docs = [];
        }
        console.log(
          `[Chatbot] General retriever returned ${docs?.length ?? 0} docs`
        );
      } catch (err) {
        console.warn("[Chatbot] Retriever error:", err?.message || err);
        docs = [];
      }
    }

    // Rest unchanged: fallback vs RAG
    if (!docs || docs.length === 0) {
      console.log("[Chatbot] No docs found, using direct model fallback");
      const fallbackResult = await fallbackChain.invoke({ question: message });
      console.log(`[Chatbot Service] Fallback reply: ${fallbackResult}`);
      return res.json({ reply: String(fallbackResult) });
    } else {
      const context = formatDocs(docs);
      const ragResult = await coreRagChain.invoke({
        context: context,
        question: message,
      });
      console.log(`[Chatbot Service] RAG reply: ${ragResult}`);
      return res.json({ reply: String(ragResult) });
    }
  } catch (error) {
    console.error("Lỗi RAG Chain:", error);
    return res.status(500).json({ reply: "Lỗi xử lý AI" });
  }
});

// 6. TÍNH NĂNG MỚI: Nhận diện "course intent" thông minh hơn
function isCourseIntentText(text, knownCategories = []) {
  if (!text) return false;
  const t = text.toLowerCase();

  // Nhóm từ khóa (20-40 items tổng)
  const direct = [
    "khóa học",
    "khóa",
    "khoá học",
    "courses",
    "course",
    "khóa học nào",
    "có khóa",
    "có khóa nào",
  ];
  const verbs = [
    "học",
    "dạy",
    "đào tạo",
    "tuyển sinh",
    "đăng ký",
    "ghi danh",
    "hoc",
  ];
  const askPhrases = [
    "có ... không",
    "có gì",
    "bạn có",
    "nào",
    "tìm khóa",
    "tìm kiếm khóa",
  ];
  const domains = [
    "công nghệ thông tin",
    "it",
    "lập trình",
    "programming",
    "web",
    "data",
    "ai",
    "machine learning",
    "an ninh mạng",
    "security",
  ];
  const metaWords = [
    "giảng viên",
    "người dạy",
    "giá",
    "price",
    "thời lượng",
    "duration",
    "bao lâu",
    "tổng quan",
    "danh sách",
  ];

  const groups = { direct, verbs, askPhrases, domains, metaWords };

  // điểm: direct=1, verbs=0.8, askPhrases=0.6, domains=1.2, metaWords=0.6
  const weights = {
    direct: 1,
    verbs: 0.8,
    askPhrases: 0.6,
    domains: 1.2,
    metaWords: 0.6,
  };

  let score = 0;
  for (const k of Object.keys(groups)) {
    for (const kw of groups[k]) {
      if (t.includes(kw)) score += weights[k];
    }
  }

  // tăng điểm nếu chứa tên category đã biết (được sync vào metadata)
  for (const cat of knownCategories) {
    const c = String(cat).toLowerCase();
    if (c && t.includes(c)) score += 1.5;
  }

  // Nếu có nhiều token (độ dài) và chứa 2 từ khóa khác nhóm -> cộng thêm
  const tokens = t.split(/\s+/).filter(Boolean);
  if (
    tokens.length > 3 &&
    (direct.some((d) => t.includes(d)) || domains.some((d) => t.includes(d)))
  ) {
    score += 0.5;
  }

  // Threshold = 1.6 (tùy chỉnh). Trả true nếu đạt.
  return score >= 1.6;
}

app.listen(PORT, () => {
  console.log(`Chatbot Service đang chạy ở http://localhost:${PORT}`);
});

// Endpoint bảo mật để trigger RAG sync (fire-and-forget)
app.post("/trigger-sync", (req, res) => {
  const incomingKey = req.headers["x-internal-api-key"];
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (
    !expectedKey ||
    !incomingKey ||
    String(incomingKey) !== String(expectedKey)
  ) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  // Fire-and-forget: gọi runSync nhưng không await
  try {
    runSync().catch((err) => {
      console.error("[Trigger-Sync] runSync failed:", err?.message || err);
    });
  } catch (err) {
    console.error(
      "[Trigger-Sync] Failed to start runSync:",
      err?.message || err
    );
  }

  return res
    .status(202)
    .json({
      success: true,
      message: "Đã chấp nhận yêu cầu. Quá trình đồng bộ đang chạy ngầm.",
    });
});
