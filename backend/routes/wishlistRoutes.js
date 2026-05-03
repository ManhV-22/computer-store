// backend/routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Lấy danh sách yêu thích
router.get('/', wishlistController.getWishlist);

// Lấy số lượng sản phẩm trong wishlist
router.get('/count', wishlistController.getWishlistCount);

// Kiểm tra sản phẩm có trong wishlist không
router.get('/check/:productId', wishlistController.checkProductInWishlist);

// Thêm sản phẩm vào danh sách yêu thích
router.post('/add', wishlistController.addToWishlist);

// Xóa sản phẩm khỏi danh sách yêu thích
router.delete('/:wishlistItemId', wishlistController.removeFromWishlist);

// Xóa toàn bộ danh sách yêu thích
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
