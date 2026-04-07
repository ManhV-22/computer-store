// backend/models/userModel.js
const db = require("../config/db");

// Tìm theo email
exports.findByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// Tạo user
exports.create = (data, callback) => {
  db.query(
    "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
    [data.name, data.email, data.password, data.role || "user", data.status ?? true],
    callback
  );
};

// Cập nhật trạng thái
exports.updateStatus = (id, status, callback) => {
  db.query("UPDATE users SET status = ? WHERE id = ?", [status, id], callback);
};

// Cập nhật mật khẩu
exports.updatePassword = (id, newPassword, callback) => {
  db.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, id], callback);
};
