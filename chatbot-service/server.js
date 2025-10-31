// chatbot-service/server.js (ĐÃ SỬA LỖI)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Khởi tạo đúng class theo exports hiện tại của @langchain/google-genai
const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = gg;

const model = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  model: "models/gemini-2.5-pro", // <-- dùng tên model từ output list-models.js
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "models/text-embedding-004", // <-- dùng tên đầy đủ từ list
});

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

if (!model || !embeddings) {
  console.error(
    "Không thể khởi tạo ChatGoogleGenerativeAI / GoogleGenerativeAIEmbeddings."
  );
  process.exit(1);
}

const retriever = vectorStore.asRetriever(3);

const promptTemplate = PromptTemplate.fromTemplate(
  `Bạn là trợ lý AI thân thiện của EduVerse.
QUY TẮC: Chỉ trả lời dựa trên "Ngữ cảnh" được cung cấp. Nếu không tìm thấy, hãy nói "Tôi không tìm thấy thông tin này."
Ngữ cảnh:
{context}
Câu hỏi:
{question}
Câu trả lời:`
);

const formatDocs = (docs) => docs.map((doc) => doc.pageContent).join("\n\n");

// --- BẮT ĐẦU SỬA LỖI ---
// Chúng ta sửa lại ragChain để đảm bảo retriever nhận được chuỗi (string)
const ragChain = RunnableSequence.from([
  {
    context: RunnableSequence.from([
      (input) => input.question, // 1. Trích xuất chuỗi câu hỏi (string)
      retriever, // 2. Đưa chuỗi (string) vào retriever
      formatDocs, // 3. Định dạng tài liệu tìm được
    ]),
    question: (input) => input.question, // Giữ nguyên câu hỏi gốc để đưa vào prompt
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);
// --- KẾT THÚC SỬA LỖI ---

// --- Tạo API Endpoint ---
app.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    console.log(`[Chatbot Service] Nhận câu hỏi: ${message}`);

    // Thử lấy docs từ vector store (kể cả khi chroma đang chạy)
    let docs = [];
    try {
      docs = await vectorStore.similaritySearch(message, 5);
      console.log(`[Chatbot] retrieved ${docs?.length ?? 0} docs`);
      if (docs && docs.length > 0) {
        console.log(
          "[Chatbot] preview doc[0]:",
          (docs[0].pageContent || "").slice(0, 200)
        );
      }
    } catch (err) {
      console.warn("[Chatbot] similaritySearch error:", err?.message || err);
      docs = [];
    }

    // Nếu không có docs -> gọi model trực tiếp (fallback)
    if (!docs || docs.length === 0) {
      console.log("[Chatbot] No docs found, using direct model fallback");
      const directPrompt = PromptTemplate.fromTemplate(
        `Bạn là trợ lý AI thân thiện của EduVerse. Trả lời ngắn gọn, bằng tiếng Việt.\n\nCâu hỏi:\n{question}\n\nCâu trả lời:`
      );
      const directChain = RunnableSequence.from([
        directPrompt,
        model,
        new StringOutputParser(),
      ]);
      const directResult = await directChain.invoke({ question: message });
      console.log(`[Chatbot Service] Direct reply: ${directResult}`);
      return res.json({ reply: String(directResult) });
    }

    // Nếu có docs -> trả tạm preview (hoặc chèn RAG chain ở đây nếu bạn đã cấu hình ragChain)
    // (nếu bạn đã có ragChain, thay phần này bằng ragChain.invoke)
    const combined = docs.map((d) => d.pageContent || "").join("\n\n");
    // ngắn gọn trả câu trả lời dựa trên docs bằng model (context + question) — simple approach:
    const ragPrompt = PromptTemplate.fromTemplate(
      `Bạn là trợ lý AI. Dưới đây là các trích xuất từ nội dung kho tư liệu:\n\n{context}\n\nCâu hỏi:\n{question}\n\nHãy trả lời bằng tiếng Việt, có dẫn nguồn ngắn (nếu có).`
    );
    const ragChain = RunnableSequence.from([
      ragPrompt,
      model,
      new StringOutputParser(),
    ]);
    const ragResult = await ragChain.invoke({
      context: combined,
      question: message,
    });
    console.log(`[Chatbot Service] RAG reply: ${ragResult}`);
    return res.json({ reply: String(ragResult) });
  } catch (error) {
    console.error("Lỗi RAG Chain:", error);
    return res.status(500).json({ reply: "Lỗi xử lý AI" });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot Service đang chạy ở http://localhost:${PORT}`);
});
