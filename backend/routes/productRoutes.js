// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Nhúng kết nối MySQL

// ==========================================
// API: LẤY DANH SÁCH TẤT CẢ SẢN PHẨM
// Đường dẫn thực tế sẽ là: GET http://localhost:3000/api/products
// ==========================================
router.get('/', async (req, res) => {
    try {
        // Truy vấn lấy toàn bộ dữ liệu từ bảng products
        // (Nếu bảng của bạn tên khác thì nhớ đổi lại chữ 'products' nhé)
        const [products] = await db.query('SELECT * FROM products');
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy sản phẩm!" });
    }
});

module.exports = router;