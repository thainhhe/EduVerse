// run.js
// put this inside e:\DDDD\Session_9\SEP490_G166\EduVerse\chatbot-service
const { runSync } = require("./sync-data2");

runSync()
  .then(() => {
    console.log("runSync finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("runSync failed:", err);
    process.exit(1);
  });
