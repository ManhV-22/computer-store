// userRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, changeStatus } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Route cho người dùng (Public)
router.post("/register", register);
router.post("/login", login);

// Route cho Admin (Khóa/Mở khóa tài khoản)
router.put("/:id/status", verifyToken, isAdmin, changeStatus);

module.exports = router;