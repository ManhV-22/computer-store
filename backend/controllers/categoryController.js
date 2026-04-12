const db = require("../config/db"); // Đảm bảo đường dẫn trỏ đúng file config db

const categoryController = {
    // Hàm lấy danh sách tất cả danh mục
    getAllCategories: async (req, res) => {
        try {
            // Đã thêm cột 'image' vào câu truy vấn
            const [rows] = await db.query('SELECT id, name, image FROM category');
            res.json(rows);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
            res.status(500).json({ message: "Lỗi lấy danh mục" });
        }
    }
};

module.exports = categoryController;