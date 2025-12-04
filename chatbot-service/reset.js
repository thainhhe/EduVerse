// chatbot-service/reset.js
const { ChromaClient } = require("chromadb");
require("dotenv").config();

async function reset() {
  const client = new ChromaClient({ path: "http://localhost:8000" }); // Kiểm tra port của bạn
  try {
    console.log("Deleting collection 'eduverse_rag'...");
    await client.deleteCollection({ name: "eduverse_rag" });
    console.log("Deleted successfully!");
  } catch (e) {
    console.log("Collection might not exist or error:", e.message);
  }
}
reset();
