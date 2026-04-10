const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Dùng chung kết nối đã cấu hình promise

// 1. API Lấy toàn bộ đơn hàng (Cho Admin Dashboard)
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM `order` ORDER BY created_at DESC");
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
});

// 2. API Đặt hàng mới
router.post("/", async (req, res) => {
    const { userId, customer, items, totalAmount } = req.body;

    try {
        // Chèn vào bảng 'order'
        const sqlOrder = "INSERT INTO `order` (user_id, total_price, status, address, phone) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(sqlOrder, [userId || null, totalAmount, 'pending', customer.address, customer.phone]);
        
        const orderId = result.insertId;

        // Chèn vào bảng 'order_detail'
        const sqlDetails = "INSERT INTO order_detail (order_id, product_id, quantity, price) VALUES ?";
        const detailValues = items.map(item => [orderId, item.id, item.quantity, item.price]);

        await db.query(sqlDetails, [detailValues]);

        res.status(201).json({ success: true, message: "Đặt hàng thành công!", orderId });
    } catch (err) {
        console.error("Lỗi lưu đơn hàng:", err);
        res.status(500).json({ success: false, message: "Lỗi lưu đơn hàng" });
    }
});

// 3. Lấy lịch sử đơn hàng của 1 user cụ thể
router.get("/user/:userId", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM `order` WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Lấy chi tiết sản phẩm của một đơn hàng
router.get("/detail/:orderId", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM order_detail WHERE order_id = ?", [req.params.orderId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

module.exports = router;