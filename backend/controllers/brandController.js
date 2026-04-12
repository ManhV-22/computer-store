const db = require("../config/db");

const brandController = {
    // 1. Lấy tất cả thương hiệu (Cho Admin thấy cả ẩn và hiện)
    getAllBrands: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM brand');
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi lấy danh sách thương hiệu" });
        }
    },

    // 2. Lấy 1 thương hiệu theo ID (Đổ dữ liệu lên form Sửa)
    getBrandById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.query('SELECT * FROM brand WHERE id = ?', [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
            }
            res.json(rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi lấy thông tin" });
        }
    },

    // 3. Thêm thương hiệu mới (Có upload file ảnh)
    addBrand: async (req, res) => {
        try {
            const { name, status } = req.body;
            
            let image = null;
            if (req.file) {
                // Đồng bộ đường dẫn theo thư mục frontend/assets/img/brands
                image = `assets/img/brands/${req.file.filename}`;
            }

            const brandStatus = status !== undefined ? status : 1;

            await db.query('INSERT INTO brand (name, image, status) VALUES (?, ?, ?)', [name, image, brandStatus]);
            res.status(201).json({ message: "Thêm thương hiệu thành công" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi thêm thương hiệu" });
        }
    },

    // 4. Cập nhật thương hiệu (Xử lý thay đổi ảnh đồng bộ)
    updateBrand: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, status } = req.body;

            if (req.file) {
                // CẬP NHẬT TẠI ĐÂY: Sử dụng cùng định dạng đường dẫn với hàm addBrand
                const image = `assets/img/brands/${req.file.filename}`;
                await db.query('UPDATE brand SET name = ?, image = ?, status = ? WHERE id = ?', [name, image, status, id]);
            } else {
                await db.query('UPDATE brand SET name = ?, status = ? WHERE id = ?', [name, status, id]);
            }

            res.json({ message: "Cập nhật thương hiệu thành công" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi cập nhật" });
        }
    },

    deleteAllProductsByBrand: async (req, res) => {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM products WHERE brand_id = ?', [id]);
            res.json({ success: true, message: "Đã xóa tất cả sản phẩm của thương hiệu này!" });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: "Lỗi khi xóa danh sách sản phẩm." });
        }
    },

    // 5. Xóa thương hiệu (Đã xử lý chặn xóa nếu có sản phẩm liên quan)
    deleteBrand: async (req, res) => {
        try {
            const { id } = req.params;

            // Kiểm tra ràng buộc
            const [products] = await db.query('SELECT id FROM products WHERE brand_id = ? LIMIT 1', [id]);
            
            if (products.length > 0) {
                // TRẢ VỀ 200 ĐỂ KHÔNG ĐỎ CONSOLE, nhưng success = false
                return res.json({ 
                    success: false, 
                    message: "Không thể xóa! Thương hiệu này đang có sản phẩm." 
                });
            }

            await db.query('DELETE FROM brand WHERE id = ?', [id]);
            res.json({ success: true, message: "Xóa thương hiệu thành công" });

        } catch (error) {
            console.error(error);
            res.json({ success: false, message: "Lỗi hệ thống khi xóa" });
        }
    }
};



module.exports = brandController;