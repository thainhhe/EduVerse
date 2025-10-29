const gg = require("@langchain/google-genai");
console.log("EXPORT KEYS:", Object.keys(gg));
console.log("FULL EXPORT (shallow):");
console.dir(gg, { depth: 2 });
