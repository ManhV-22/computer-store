const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Đảm bảo đường dẫn này đúng với file config của bạn

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name FROM brand');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy thương hiệu:", error);
        res.status(500).json({ message: "Lỗi lấy thương hiệu" });
    }
});

module.exports = router; // Quan trọng: Phải có dòng này