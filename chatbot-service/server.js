// chatbot-service/server.js (ĐÃ SỬA LỖI)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Chroma } = require("@langchain/community/vectorstores/chroma"); // <--- SỬA Ở ĐÂY
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
  model: "gemini-1.5-flash-latest",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "text-embedding-004",
});

if (!model || !embeddings) {
  console.error(
    "Không thể khởi tạo ChatGoogleGenerativeAI / GoogleGenerativeAIEmbeddings."
  );
  process.exit(1);
}

const client = new ChromaClient({ path: CHROMA_URL });
const vectorStore = new Chroma(embeddings, {
  collectionName: COLLECTION_NAME,
  url: CHROMA_URL, // Đảm bảo URL là CHROMA_URL
});

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

const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocs),
    question: (input) => input.question,
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);

// --- Tạo API Endpoint ---
app.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`[Chatbot Service] Nhận câu hỏi: ${message}`);

    const result = await ragChain.invoke({ question: message });

    console.log(`[Chatbot Service] Gửi câu trả lời: ${result}`);
    res.json({ reply: result });
  } catch (error) {
    console.error("Lỗi RAG Chain:", error);
    res.status(500).json({ error: "Lỗi xử lý AI" });
  }
});

app.listen(PORT, () => {
  console.log(
    `Chatbot Service ("build riêng") đang chạy ở http://localhost:${PORT}`
  );
});
