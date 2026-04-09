// orderRoutes.js
// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Cấu hình kết nối (Nếu bạn có file db.js riêng thì nên import vào đây)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'computer_store' 
});

router.post("/", (req, res) => {
    const { userId, customer, items, totalAmount } = req.body;

    // 1. Chèn vào bảng 'order'
    const sqlOrder = "INSERT INTO `order` (user_id, total_price, status, address, phone) VALUES (?, ?, ?, ?, ?)";
    const orderValues = [userId || null, totalAmount, 'pending', customer.address, customer.phone];

    db.query(sqlOrder, orderValues, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi lưu đơn hàng" });
        }

        const orderId = result.insertId;

        // 2. Chèn vào bảng 'order_details'
        const sqlDetails = "INSERT INTO order_detail (order_id, product_id, quantity, price) VALUES ?";
        const detailValues = items.map(item => [orderId, item.id, item.quantity, item.price]);

        db.query(sqlDetails, [detailValues], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Lỗi lưu chi tiết đơn hàng" });
            }
            res.status(201).json({ message: "Đặt hàng thành công!", orderId });
        });
    });
});

// Lấy lịch sử đơn hàng của 1 user cụ thể
router.get("/user/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM `order` WHERE user_id = ? ORDER BY created_at DESC";

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Lấy chi tiết sản phẩm của một đơn hàng
router.get("/detail/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    // Query kết hợp (JOIN) để lấy thêm tên sản phẩm nếu muốn, 
    // hiện tại ta lấy từ bảng order_detail trước
    const sql = "SELECT * FROM order_detail WHERE order_id = ?";

    db.query(sql, [orderId], (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi máy chủ" });
        res.json(results);
    });
});
module.exports = router;