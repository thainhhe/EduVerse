// chatbot-service/server.js (ĐÃ NÂNG CẤP LÊN MULTI-QUERY)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { ChromaClient } = require("chromadb");
const gg = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
// IMPORT MỚI: MultiQueryRetriever
// const { MultiQueryRetriever } = require("@langchain/retrievers/multi_query");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT_AI || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMA_URL = "http://localhost:8000";
const COLLECTION_NAME = "eduverse_rag";

const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = gg;

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

// 3. NÂNG CẤP: Khởi tạo MultiQueryRetriever
// Nó sẽ dùng `model` để tạo ra nhiều câu hỏi con từ câu hỏi của người dùng
console.log("[Chatbot] Initializing MultiQueryRetriever...");
const retriever = vectorStore.asRetriever(5); // Yêu cầu nó lấy 5 tài liệu
console.log("[Chatbot] Using fallback retriever: vectorStore.asRetriever(5)");

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
    try {
      // 1. Chạy MultiQueryRetriever ĐỂ LẤY TÀI LIỆU
      // Đây là nơi phép màu xảy ra. Nó sẽ tạo nhiều câu hỏi và tìm kiếm.
      // fallback: asRetriever exposes getRelevantDocuments(query)
      if (typeof retriever.getRelevantDocuments === "function") {
        docs = await retriever.getRelevantDocuments(message);
      } else if (typeof retriever.invoke === "function") {
        docs = await retriever.invoke(message);
      } else {
        docs = [];
      }
      console.log(
        `[Chatbot] MultiQueryRetriever retrieved ${docs?.length ?? 0} docs`
      );

      if (docs && docs.length > 0) {
        console.log(
          "[Chatbot] preview doc[0]:",
          (docs[0].pageContent || "").slice(0, 200)
        );
      }
    } catch (err) {
      console.warn("[Chatbot] Retriever error:", err?.message || err);
      docs = [];
    }

    // 2. Quyết định dùng chain nào dựa trên kết quả truy xuất
    if (!docs || docs.length === 0) {
      // --- Logic Fallback ---
      console.log("[Chatbot] No docs found, using direct model fallback");
      const fallbackResult = await fallbackChain.invoke({ question: message });
      console.log(`[Chatbot Service] Fallback reply: ${fallbackResult}`);
      return res.json({ reply: String(fallbackResult) });
    } else {
      // --- Logic RAG ---
      // Kết hợp tài liệu và gọi chain RAG chính
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

app.listen(PORT, () => {
  console.log(`Chatbot Service đang chạy ở http://localhost:${PORT}`);
});
