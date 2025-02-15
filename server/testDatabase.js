const db = require("./database");

(async () => {
  try {
    console.log("⏳ Connecting to MySQL...");
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    console.log("✅ MySQL Connected! Test Query Result:", rows[0].result);
    process.exit(0);
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
    process.exit(1);
  }
})();
