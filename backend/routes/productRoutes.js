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
        res.json(rows); // Trả về mảng JSON
    } catch (error) {
        console.error("Lỗi DB:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu" });
    }
});

// API: Lấy danh sách sản phẩm (Join để lấy tên Brand/Category nếu cần)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ message: "Không tìm thấy" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Thêm sản phẩm đầy đủ các trường theo DB
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, price, quantity, description, category_id, brand_id, status } = req.body;
        
        // Lấy tên file từ req.file (do dùng upload.single)
        const imageFile = req.file ? req.file.filename : '';

        const sql = `
            INSERT INTO products 
            (name, price, quantity, description, category_id, brand_id, status, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [name, price, quantity || 0, description, category_id, brand_id, status, imageFile];

        const [result] = await db.query(sql, values);
        
        res.json({ success: true, message: "Thêm thành công!" });
    } catch (error) {
        console.error("Lỗi thêm sản phẩm tại Backend:", error);
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Thực hiện xóa trong DB
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Đã xóa sản phẩm" });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server khi xóa" });
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, quantity, description, category_id, brand_id, status, is_featured } = req.body;
        
        let sql, values;
        // Chuyển is_featured từ chuỗi "true"/"false" sang số 1/0
        const featuredValue = is_featured === 'true' || is_featured === '1' ? 1 : 0;

        if (req.file) {
            sql = `UPDATE products SET name=?, price=?, quantity=?, description=?, category_id=?, brand_id=?, status=?, is_featured=?, image=? WHERE id=?`;
            values = [name, price, quantity, description, category_id, brand_id, status, featuredValue, req.file.filename, id];
        } else {
            sql = `UPDATE products SET name=?, price=?, quantity=?, description=?, category_id=?, brand_id=?, status=?, is_featured=? WHERE id=?`;
            values = [name, price, quantity, description, category_id, brand_id, status, featuredValue, id];
        }

        await db.query(sql, values);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;