// db.js
const mysql = require("mysql2");

// tạo connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // nếu có thì nhập
  database: "computer_store"
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối DB:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

module.exports = db;
