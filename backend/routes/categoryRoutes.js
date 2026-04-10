const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Đảm bảo đường dẫn trỏ đúng file config db

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name FROM categories');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({ message: "Lỗi lấy danh mục" });
    }
});

module.exports = router; // Quan trọng: Phải có dòng này