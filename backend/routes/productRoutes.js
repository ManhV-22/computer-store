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
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
});

// API: Thêm sản phẩm đầy đủ các trường theo DB
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const { name, price, quantity, description, brand_id, category_id, status } = req.body;
        const imageFiles = req.files.map(file => file.filename);
        const imageString = imageFiles.join(',');

        const sql = `INSERT INTO products 
            (name, image, price, quantity, description, brand_id, status, category_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        
        await db.query(sql, [name, imageString, price, quantity, description, brand_id, status || 'active', category_id]);
        
        res.json({ success: true, message: "Thêm sản phẩm thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lưu sản phẩm" });
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