const db = require('../config/db');
const Review = require('../models/reviewModel');

// Lấy danh sách sản phẩm (Bao gồm cả lọc theo Brand)
exports.getAllProducts = async (req, res) => {
    try {
        const { brand_id } = req.query;

        // Câu SQL đã gộp JOIN từ code cũ của bạn
        let sql = `
            SELECT p.*, c.name AS category_name, b.name AS brand_name 
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN brand b ON p.brand_id = b.id
            WHERE p.status = 1
        `;
        let params = [];

        // Nếu có brand_id truyền lên, thêm điều kiện lọc
        if (brand_id && brand_id !== 'undefined' && brand_id !== 'null') {
            sql += ` AND p.brand_id = ? `;
            params.push(brand_id);
        }

        sql += ` ORDER BY p.id DESC`;

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi DB:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu" });
    }
};

// Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            const product = rows[0];
            const reviews = await Review.getByProductId(req.params.id);
            const avgRating = await Review.getAverageRating(req.params.id);
            product.reviews = reviews;
            product.average_rating = Number(avgRating.avg_rating) || 0;
            product.total_reviews = Number(avgRating.total_reviews) || 0;
            res.json(product);
        } else {
            res.status(404).json({ message: "Không tìm thấy" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Thêm sản phẩm
exports.addProduct = async (req, res) => {
    try {
        const { name, price, quantity, description, category_id, brand_id, status } = req.body;
        const imageFile = req.files && req.files.length > 0 
            ? req.files.map(file => file.filename).join(',') 
            : '';

        const sql = `
            INSERT INTO products 
            (name, price, quantity, description, category_id, brand_id, status, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [name, price, quantity || 0, description, category_id, brand_id, status, imageFile];

        await db.query(sql, values);
        res.json({ success: true, message: "Thêm thành công!" });
    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, quantity, description, category_id, brand_id, status, is_featured } = req.body;
        
        const featuredValue = (is_featured === 'true' || is_featured === '1') ? 1 : 0;
        let sql, values;

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
};

// Thêm đánh giá sản phẩm
exports.addReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user && req.user.id ? Number(req.user.id) : null;
        const score = Number(rating);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để đánh giá." });
        }

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" });
        }

        await Review.add(productId, userId, score, comment || '');
        res.json({ success: true, message: "Đánh giá đã được thêm!" });
    } catch (error) {
        console.error("Lỗi thêm đánh giá:", error.message || error);
        res.status(500).json({ success: false, message: error.message || "Lỗi Server" });
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Đã xóa sản phẩm" });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server khi xóa" });
    }
};