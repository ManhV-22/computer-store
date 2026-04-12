const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 1. Chỉ đường từ file hiện tại (backend/routes) ra thư mục gốc rồi đi vào frontend
// __dirname đang là 'backend/routes'. Lùi 2 cấp ('../../') sẽ ra thư mục PROJECT gốc
const uploadDir = path.join(__dirname, '../../frontend/assets/img/brands');

// 2. Tự động tạo thư mục nếu bạn chưa tạo sẵn
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Cấu hình Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Lưu thẳng vào thư mục frontend
    },
    filename: function (req, file, cb) {
        const safeFileName = file.originalname.replace(/\s+/g, '-');
        cb(null, Date.now() + '-' + safeFileName);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// CÁC ROUTE API
// ==========================================
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', upload.single('image'), brandController.addBrand);
router.put('/:id', upload.single('image'), brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);
router.delete('/:id/products', brandController.deleteAllProductsByBrand);

module.exports = router;