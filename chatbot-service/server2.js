// chatbot-service/server.js (ĐÃ NÂNG CẤP LÊN MULTI-QUERY)
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// --- THÊM MỚI: Import node-cron ---
const cron = require("node-cron");

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
// const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });
const vectorStore = new Chroma(embeddings, {
  collectionName: COLLECTION_NAME,
  url: CHROMA_URL,
  // client,
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
const generalRetriever = vectorStore.asRetriever(50);

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

// ==========================================
// 🚀 CẤU HÌNH CRON JOB (CHẠY 15 PHÚT/LẦN)
// ==========================================
console.log("[Cron] Initializing scheduled tasks...");

// Cấu trúc: "*/15 * * * *" nghĩa là chạy vào phút thứ 0, 15, 30, 45 mỗi giờ
cron.schedule("*/15 * * * *", async () => {
  console.log(
    `[Cron] ⏰ Triggering auto-sync at ${new Date().toISOString()}...`
  );
  try {
    // Gọi hàm đồng bộ dữ liệu
    await runSync();
    console.log("[Cron] ✅ Auto-sync completed successfully.");
  } catch (err) {
    console.error("[Cron] ❌ Auto-sync failed:", err?.message || err);
  }
});
// ==========================================

// 4. TỐI ƯU: Định nghĩa các chain xử lý chính
const formatDocs = (docs) => docs.map((doc) => doc.pageContent).join("\n\n");

// --- Chain RAG (Không cần thay đổi nội dung prompt) ---
const ragPromptTemplate = PromptTemplate.fromTemplate(
  `Bạn là trợ lý AI. Dưới đây là các trích xuất từ nội dung kho tư liệu:\n\n{context}\n\nCâu hỏi:\n{question}\n\nHãy trả lời bằng tiếng Việt, có dẫn nguồn ngắn (nếu có).`
);

// --- Chain Fallback (Không cần thay đổi nội dung prompt) ---
const fallbackPrompt = PromptTemplate.fromTemplate(
  `Bạn là trợ lý AI thân thiện của EduVerse. Trả lời ngắn gọn, bằng tiếng Việt.\n\nCâu hỏi:\n{question}\n\nCâu trả lời:`
);

// 5. TỐI ƯU: Endpoint /query (Cập nhật để hỗ trợ streaming)
app.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    console.log(`[Chatbot Service] Nhận câu hỏi: ${message}`);

    // Cấu hình headers cho streaming (gửi từng chunk JSON trên kết nối mở)
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Tìm kiếm tài liệu giống logic cũ
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

    // Chọn chain để stream
    let chainToStream;
    let context = "";
    let finalResponse = "";

    if (!docs || docs.length === 0) {
      console.log(
        "[Chatbot] No docs found, using direct model fallback stream"
      );
      chainToStream = fallbackPrompt.pipe(model).pipe(new StringOutputParser());
      context = "";
    } else {
      console.log(
        `[Chatbot] Docs found, using RAG stream (${docs.length} docs)`
      );
      context = formatDocs(docs);
      chainToStream = ragPromptTemplate
        .pipe(model)
        .pipe(new StringOutputParser());
    }

    // Khởi tạo stream từ chain
    const stream = await chainToStream.stream({
      context: context,
      question: message,
    });

    // Nếu client đóng kết nối, attempt to stop reading
    let clientClosed = false;
    req.on("close", () => {
      clientClosed = true;
      console.log("[Chatbot] Client closed connection");
    });

    for await (const chunk of stream) {
      if (clientClosed) break;
      const chunkData = {
        type: "text",
        content: String(chunk),
      };
      // gửi từng chunk dưới dạng JSON line
      res.write(JSON.stringify(chunkData) + "\n");
      finalResponse += String(chunk);
    }

    // Nếu client chưa đóng, gửi end marker
    if (!clientClosed) {
      const endData = {
        type: "end",
        reply: finalResponse,
      };
      res.write(JSON.stringify(endData) + "\n");
      res.end();
    } else {
      // ensure response ended
      try {
        res.end();
      } catch (e) {
        // ignore
      }
    }
  } catch (error) {
    console.error("Lỗi RAG Chain:", error);
    try {
      // Nếu headers đã được gửi, cố gắng stream lỗi
      res.write(
        JSON.stringify({
          type: "error",
          message: "Lỗi xử lý AI: " + (error?.message || error),
        }) + "\n"
      );
      res.end();
    } catch (e) {
      // fallback
      return res.status(500).json({ reply: "Lỗi xử lý AI" });
    }
  }
});

// 6. TÍNH NĂNG MỚI: Nhận diện "course intent" thông minh hơn
function isCourseIntentText(text, knownCategories = []) {
  if (!text) return false;
  const t = text.toLowerCase();

  // THÊM MỚI: Keywords về review/rating
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

  // THÊM MỚI: Keywords về đánh giá/review
  const reviewKeywords = [
    "review",
    "đánh giá",
    "rating",
    "sao",
    "⭐",
    "kết quả",
    "feedback",
    "nhận xét",
    "ý kiến",
    "tốt không",
    "như thế nào",
    "chất lượng",
  ];

  const groups = {
    direct,
    verbs,
    askPhrases,
    domains,
    metaWords,
    reviewKeywords,
  };

  const weights = {
    direct: 1,
    verbs: 0.8,
    askPhrases: 0.6,
    domains: 1.2,
    metaWords: 0.6,
    reviewKeywords: 1.0, // THÊM MỚI
  };

  let score = 0;
  for (const k of Object.keys(groups)) {
    for (const kw of groups[k]) {
      if (t.includes(kw)) score += weights[k];
    }
  }

  // tăng điểm nếu chứa tên category đã biết
  for (const cat of knownCategories) {
    const c = String(cat).toLowerCase();
    if (c && t.includes(c)) score += 1.5;
  }

  // Nếu có nhiều token và chứa 2 từ khóa khác nhóm -> cộng thêm
  const tokens = t.split(/\s+/).filter(Boolean);
  if (
    tokens.length > 3 &&
    (direct.some((d) => t.includes(d)) || domains.some((d) => t.includes(d)))
  ) {
    score += 0.5;
  }

  return score >= 1.6;
}

app.listen(PORT, () => {
  console.log(`Chatbot Service đang chạy ở http://localhost:${PORT}`);

  // GỌI runSync MỘT LẦN KHI STARTUP (không block)
  runSync()
    .then(() => console.log("[Startup] Initial runSync completed"))
    .catch((err) =>
      console.error("[Startup] Initial runSync failed:", err?.message || err)
    );
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

  return res.status(202).json({
    success: true,
    message: "Đã chấp nhận yêu cầu. Quá trình đồng bộ đang chạy ngầm.",
  });
});
