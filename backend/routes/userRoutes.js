// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt'); // Thêm thư viện mã hóa

// ==========================================
// 1. API ĐĂNG KÝ (Mã hóa mật khẩu trước khi lưu)
// ==========================================
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
        }

        // Mã hóa mật khẩu (SaltRounds = 10 là mức độ bảo mật chuẩn)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu mật khẩu ĐÃ MÃ HÓA vào Database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]
        );

        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
});

// ==========================================
// 2. API ĐĂNG NHẬP (So sánh mật khẩu)
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Đảm bảo SELECT lấy cả cột role
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json({ 
                    success: true,
                    message: "Đăng nhập thành công!",
                    token: "day_la_chuoi_token_gia_lap_123", 
                    // 2. PHẢI TRẢ VỀ ROLE Ở ĐÂY
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email,
                        role: user.role // Thêm dòng này
                    }
                });
            } else {
                res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
            }
        } else {
            res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, status FROM users');
        res.json({ success: true, data: rows }); // Trả về cấu trúc { success, data }
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
});
module.exports = router;