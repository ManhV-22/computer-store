// adminRoutes.js
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'computer_store'
});

// 1. Lấy TẤT CẢ đơn hàng (Dành cho Admin & Nhân viên)
router.get("/orders", (req, res) => {
    const sql = "SELECT * FROM `order` ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Cập nhật trạng thái đơn hàng (Dành cho Admin & Nhân viên)
router.put("/orders/:id/status", (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    const sql = "UPDATE `order` SET status = ? WHERE id = ?";

    db.query(sql, [status, orderId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cập nhật trạng thái thành công!" });
    });
});

module.exports = router;