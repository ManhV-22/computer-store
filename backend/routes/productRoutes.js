const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// Cấu hình Multer để upload ảnh (Giữ nguyên của bạn)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/assets/img/products'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// === CHỈ ĐIỀU HƯỚNG ROUTE ===
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/add', upload.array('images', 5), productController.addProduct);
router.put('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;