const db = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        // execute trả về 1 mảng chứa [rows, fields]. 
        // Chúng ta dùng [rows] để lấy danh sách dữ liệu.
        const [rows] = await db.execute('SELECT * FROM products WHERE status = 1');

        // Kiểm tra nếu rows tồn tại
        if (!rows) {
            return res.status(200).json([]);
        }

        res.status(200).json(rows);
    } catch (error) {
        // In lỗi chi tiết ra Terminal để kiểm tra
        console.error("Chi tiết lỗi SQL:", error); 
        res.status(500).json({ 
            message: "Lỗi thực thi truy vấn", 
            error: error.message 
        });
    }
};