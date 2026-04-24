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

// ==========================================
// CÁC API MỚI CHO ADMIN (SỬA & XÓA)
// ==========================================

// 5. Cập nhật đơn hàng (Gộp chung Cập nhật thông tin và Cập nhật trạng thái)
router.put("/:id", async (req, res) => {
    const orderId = req.params.id;
    const { phone, address, status } = req.body;

    try {
        let sql = '';
        let params = [];

        // Kiểm tra xem frontend gửi lên 'status' hay là gửi 'phone & address'
        if (status) {
            sql = "UPDATE `order` SET status = ? WHERE id = ?";
            params = [status, orderId];
        } else {
            sql = "UPDATE `order` SET phone = ?, address = ? WHERE id = ?";
            params = [phone, address, orderId];
        }

        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        res.json({ success: true, message: 'Cập nhật đơn hàng thành công!' });
    } catch (err) {
        console.error("Lỗi khi cập nhật đơn hàng:", err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lưu thay đổi!' });
    }
});

// 6. Xóa đơn hàng
router.delete("/:id", async (req, res) => {
    try {
        // Phải xóa chi tiết đơn hàng (order_detail) trước để tránh lỗi khóa ngoại (Foreign Key)
        await db.query("DELETE FROM order_detail WHERE order_id = ?", [req.params.id]);
        
        // Sau đó mới xóa đơn hàng chính
        const [result] = await db.query("DELETE FROM `order` WHERE id = ?", [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        res.json({ success: true, message: 'Xóa đơn hàng thành công!' });
    } catch (err) {
        console.error("Lỗi khi xóa đơn hàng:", err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

module.exports = router;