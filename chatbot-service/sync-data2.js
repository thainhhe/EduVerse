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

const buildText = (type, doc) => {
  switch (type) {
    case "course":
      const durationStr =
        doc.duration && typeof doc.duration === "object"
          ? `${doc.duration.value ?? ""} ${doc.duration.unit ?? ""}`.trim()
          : doc.duration || "N/A";
      // NOTE: use "Instructor subjects" label to avoid implying these are course topics
      const instrSubjects =
        doc.main_instructor_subject &&
        Array.isArray(doc.main_instructor_subject)
          ? doc.main_instructor_subject.join(",")
          : doc.main_instructor_subject || "N/A";
      return `Course: ${doc.title || "Untitled"}. Description: ${
        doc.description || ""
      }. Price: ${doc.price ?? "N/A"}. Status: ${
        doc.status || "N/A"
      }. Instructor: ${
        doc.main_instructor_name || doc.main_instructor || "N/A"
      } (${
        doc.main_instructor_job_title || "N/A"
      }). Instructor subjects: ${instrSubjects}. Duration: ${durationStr}.`;
    case "category":
      return `Category: ${doc.name || "Untitled"}. Description: ${
        doc.description || ""
      }.`;
    case "module":
      // 'doc' từ API đã chứa course_title và course_price + course_main_instructor_*
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
      // 'doc' từ API đã chứa module_title, course_title, course_price
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

// Exportable function để gọi từ server (event-driven). KHÔNG tự chạy khi import.
async function runSync() {
  console.log("Start syncing from BACKEND API to ChromaDB..."); // <-- Log đã cập nhật

  // --- KIỂM TRA BIẾN MÔI TRƯỜNG MỚI ---
  if (!BACKEND_API_URL) {
    console.error("MISSING BACKEND_API_URL in .env");
    return; // không process.exit để tránh kill server khi gọi từ /trigger-sync
  }
  if (!INTERNAL_API_KEY) {
    console.error("MISSING INTERNAL_API_KEY in .env. Cannot authenticate.");
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
      });
      if (response.data && response.data.success && response.data.data) {
        apiData = response.data.data;
      } else {
        throw new Error("Invalid API response structure from backend.");
      }
      console.log(
        `Fetched from API - courses:${
          apiData.courses?.length || 0
        }, categories:${apiData.categories?.length || 0}, modules:${
          apiData.modules?.length || 0
        }, ...`
      );
    } catch (e) {
      console.error(
        "Backend API call error:",
        e.response ? e.response.data : e.message || e
      );
      return;
    }
  } catch (err) {
    console.error("Sync run failed:", err?.message || err);
  } finally {
    console.log("Sync run finished (end of runSync).");
  }
}

module.exports = { runSync, buildText };
