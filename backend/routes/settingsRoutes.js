const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tự động xác định đường dẫn đến thư mục banners ở frontend
const uploadDir = path.join(__dirname, "../../frontend/assets/img/banners/");

// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 1. API Lấy cấu hình (Banner, Sale)
router.get("/home-configs", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT config_key, config_value FROM web_settings");
        const configs = rows.reduce((acc, row) => {
            acc[row.config_key] = row.config_value;
            return acc;
        }, {});
        res.json({ success: true, data: configs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. API Upload nhiều ảnh cho Slider
router.post("/upload-banners", upload.array("banners", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "Không có file" });
        }
        const fileNames = req.files.map(file => file.filename);
        const jsonValue = JSON.stringify(fileNames);

        await db.query(
            "UPDATE web_settings SET config_value = ? WHERE config_key = 'main_banners'",
            [jsonValue]
        );
        res.json({ success: true, files: fileNames });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. API Lấy các Section sản phẩm trang chủ
router.get("/home-sections", async (req, res) => {
    try {
        // Lấy các danh mục được phép hiện (Laptop và PC Lắp Ráp của bạn)
        const [categories] = await db.query(
            "SELECT id, name FROM category WHERE show_on_home = 1 ORDER BY home_order ASC"
        );

        if (categories.length === 0) {
            return res.json({ success: true, data: [], message: "Không có danh mục nào để hiển thị" });
        }

        const sections = await Promise.all(categories.map(async (cat) => {
            // Lấy tối đa 8 sản phẩm thuộc danh mục này
            const [products] = await db.query(
                "SELECT * FROM products WHERE category_id = ? LIMIT 8", 
                [cat.id]
            );
            return {
                categoryName: cat.name,
                products: products
            };
        }));

        res.json({ success: true, data: sections });
    } catch (err) {
        console.error("LỖI SQL TẠI ĐÂY ->", err.message);
        res.status(500).json({ success: false, error: "Lỗi truy vấn cơ sở dữ liệu" });
    }
});

router.post("/upload-sub-banner", upload.single("banner"), async (req, res) => {
    try {
        const { key } = req.body; // 'sub_banner_1' hoặc 'sub_banner_2'
        const fileName = req.file.filename;

        await db.query(
            "UPDATE web_settings SET config_value = ? WHERE config_key = ?",
            [fileName, key]
        );

        res.json({ success: true, fileName });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API 2: Cập nhật thời gian Flash Sale
router.post("/update-flashsale", async (req, res) => {
    try {
        const { endTime } = req.body; // Định dạng: "2024-12-31T23:59"
        
        await db.query(
            "UPDATE web_settings SET config_value = ? WHERE config_key = 'flash_sale_end'",
            [endTime]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;