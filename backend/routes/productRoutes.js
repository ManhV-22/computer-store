const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/assets/img'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// API: Lấy danh sách sản phẩm (Join để lấy tên Brand/Category nếu cần)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.name AS category_name, b.name AS brand_name 
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN brand b ON p.brand_id = b.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
});

// API: Thêm sản phẩm đầy đủ các trường theo DB
router.post('/', upload.array('images'), async (req, res) => {
    try {
        // 1. Lấy đủ các trường từ req.body (bao gồm status)
        const { name, price, quantity, description, category_id, brand_id, status } = req.body;
        
        // Xử lý chuỗi tên ảnh
        const imageFiles = req.files ? req.files.map(file => file.filename).join(',') : '';

        // 2. Thêm cột status vào câu lệnh SQL
        const sql = `
            INSERT INTO products 
            (name, price, quantity, description, category_id, brand_id, status, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [name, price, quantity, description, category_id, brand_id, status, imageFiles];

        const [result] = await db.query(sql, values);
        
        res.json({ success: true, message: "Thêm thành công!" });
    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa" });
    }
});

module.exports = router;