// backend/controllers/wishlistController.js
const Wishlist = require('../models/wishlistModel');

// Lấy danh sách yêu thích của user
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        const wishlistItems = await Wishlist.getWishlistItems(userId);
        res.json({ success: true, data: wishlistItems });
    } catch (error) {
        console.error('Lỗi lấy wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Thêm sản phẩm vào danh sách yêu thích
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Thiếu productId' });
        }

        const result = await Wishlist.addToWishlist(userId, productId);
        res.json(result);
    } catch (error) {
        console.error('Lỗi thêm vào wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xóa sản phẩm khỏi danh sách yêu thích
exports.removeFromWishlist = async (req, res) => {
    try {
        const { wishlistItemId } = req.params;

        if (!wishlistItemId) {
            return res.status(400).json({ success: false, message: 'Thiếu wishlistItemId' });
        }

        const result = await Wishlist.removeFromWishlist(wishlistItemId);
        res.json(result);
    } catch (error) {
        console.error('Lỗi xóa khỏi wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Kiểm tra sản phẩm có trong wishlist không
exports.checkProductInWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        const wishlistItemId = await Wishlist.checkProductInWishlist(userId, productId);
        res.json({ success: true, exists: wishlistItemId !== null, wishlistItemId });
    } catch (error) {
        console.error('Lỗi kiểm tra wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xóa toàn bộ danh sách yêu thích
exports.clearWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        const result = await Wishlist.clearWishlist(userId);
        res.json(result);
    } catch (error) {
        console.error('Lỗi xóa wishlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy số lượng sản phẩm trong wishlist
exports.getWishlistCount = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];

        if (!userId) {
            return res.json({ success: true, count: 0 });
        }

        const count = await Wishlist.getWishlistCount(userId);
        res.json({ success: true, count });
    } catch (error) {
        console.error('Lỗi lấy số lượng wishlist:', error);
        res.json({ success: true, count: 0 });
    }
};
