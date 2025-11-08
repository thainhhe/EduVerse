require("dotenv").config();
const mongoose = require("mongoose");
const { ChromaClient } = require("chromadb");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMA_HOST = "localhost";
const CHROMA_PORT = 8000;
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "eduverse_rag";
// cap mỗi collection để tránh memory spike (tùy chỉnh bằng env)
const MAX_DOCS_PER_COLLECTION =
  Number(process.env.MAX_DOCS_PER_COLLECTION) || 1000;

const isTextField = (v) => typeof v === "string" && v.trim().length > 0;
const firstOf = (obj, keys) => {
  for (const k of keys) if (obj[k]) return obj[k];
  return null;
};

// Tạo pageContent bằng cách ưu tiên các trường văn bản quan trọng
const buildPageContent = (doc) => {
  const priorityKeys = ["title", "name", "heading", "subject", "question"];
  const bodyKeys = [
    "description",
    "summary",
    "content",
    "body",
    "text",
    "message",
  ];
  const parts = [];

  // priority
  for (const k of priorityKeys) {
    if (isTextField(doc[k])) parts.push(`${k}: ${doc[k]}`);
  }

  // body fields
  for (const k of bodyKeys) {
    if (isTextField(doc[k])) parts.push(`${k}: ${doc[k]}`);
  }

  // fallback: collect other string fields (limit total length)
  const otherPieces = [];
  for (const [k, v] of Object.entries(doc)) {
    if (parts.length > 0 && otherPieces.join(" ").length > 2000) break;
    if (
      priorityKeys.includes(k) ||
      bodyKeys.includes(k) ||
      k === "_id" ||
      k === "__v"
    )
      continue;
    if (isTextField(v)) otherPieces.push(`${k}: ${v}`);
    else if (Array.isArray(v) && v.length && typeof v[0] === "string")
      otherPieces.push(`${k}: ${v.slice(0, 10).join(", ")}`);
  }
  if (otherPieces.length) parts.push(...otherPieces);

  const joined = parts.join("\n\n");
  // limit size to avoid very large embeddings
  return joined.slice(0, 15000);
};

const sanitizeMetadata = (doc, collectionName) => {
  const meta = { collection: collectionName, id: String(doc._id) };
  for (const [k, v] of Object.entries(doc)) {
    if (k === "__v" || k === "_id") continue;
    const t = typeof v;
    if (v === null || t === "string" || t === "number" || t === "boolean") {
      meta[k] = v;
    } else {
      try {
        meta[k] = JSON.stringify(v);
      } catch (e) {
        meta[k] = String(v);
      }
    }
  }
  return meta;
};

const connectMongo = async () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set. Exiting.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const run = async () => {
  console.log("Starting full sync to Chroma...");

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set. Exiting.");
    process.exit(1);
  }

  await connectMongo();
  console.log("Mongo connected.");

  // list collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections
    .map((c) => c.name)
    .filter(
      (n) => !n.startsWith("system.") && n !== "chroma" && n !== "chroma-"
    ) // skip system
    .sort();

  console.log("Collections to sync:", collectionNames);

  const docsForChroma = [];
  let totalDocs = 0;

  for (const name of collectionNames) {
    try {
      const col = mongoose.connection.db.collection(name);
      const count = await col.countDocuments();
      if (count === 0) {
        console.log(`Skipping collection ${name} (empty).`);
        continue;
      }
      console.log(`Reading collection ${name} (${count} docs).`);

      const cursor = col.find({}).limit(MAX_DOCS_PER_COLLECTION);
      const docs = await cursor.toArray();

      for (const doc of docs) {
        const pageContent = buildPageContent(doc);
        // if pageContent is empty, create fallback summary of keys
        const content =
          pageContent && pageContent.trim().length
            ? pageContent
            : `Document in ${name} - id: ${doc._id}`;
        const metadata = sanitizeMetadata(doc, name);
        docsForChroma.push({
          pageContent: content,
          metadata,
          id: `doc-${name}-${String(doc._id)}`,
        });
        totalDocs += 1;
      }
      console.log(`Added ${docs.length} docs from ${name}.`);
    } catch (e) {
      console.warn(`Failed reading collection ${name}:`, e.message || e);
    }
  }

  if (docsForChroma.length === 0) {
    console.log("No documents extracted. Exiting.");
    await mongoose.disconnect();
    return;
  }

  console.log(
    `Total documents prepared for Chroma: ${docsForChroma.length} (capped per collection: ${MAX_DOCS_PER_COLLECTION}).`
  );

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_API_KEY,
    model: process.env.EMBEDDING_MODEL || "text-embedding-004",
  });

  const client = new ChromaClient({
    host: CHROMA_HOST,
    port: CHROMA_PORT,
    ssl: false,
  });

  try {
    // try delete existing collection
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Deleted existing Chroma collection: ${COLLECTION_NAME}`);
    } catch {
      console.log("No existing collection to delete, creating new one.");
    }

    // sanitize docs for Chroma (ensure metadata values are strings/numbers/booleans)
    const sanitized = docsForChroma.map((d) => ({
      pageContent: d.pageContent,
      metadata: d.metadata,
      id: d.id,
    }));

    await Chroma.fromDocuments(sanitized, embeddings, {
      collectionName: COLLECTION_NAME,
      client,
    });

    console.log(
      `Uploaded ${sanitized.length} documents into Chroma collection "${COLLECTION_NAME}".`
    );
  } catch (err) {
    console.error("Failed to upsert to Chroma:", err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log("Mongo disconnected. Sync finished.");
  }
};

run().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
