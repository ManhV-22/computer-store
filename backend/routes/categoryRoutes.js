const express = require("express");
const router = express.Router();

// Import file Controller bạn vừa tạo
const categoryController = require("../controllers/categoryController");

// Khi có người gọi GET '/', hãy chạy hàm getAllCategories trong Controller
router.get('/', categoryController.getAllCategories);

module.exports = router; // Quan trọng: Phải có dòng này