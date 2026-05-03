// authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  console.log('[BACKEND] Auth header received:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "Không có token" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  console.log('[BACKEND] Token extracted:', token ? token.substring(0, 20) + '...' : 'null');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[BACKEND] Token verification error:', err.message);
      return res.status(403).json({ message: "Token không hợp lệ" });
    }

    console.log('[BACKEND] Token verified for user:', user);
    req.user = user; // lưu user vào request
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền" });
  }
  next();
};