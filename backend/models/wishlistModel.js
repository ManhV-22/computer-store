// backend/models/wishlistModel.js
const db = require('../config/db');

const Wishlist = {
    // Lấy hoặc tạo wishlist của user
    getOrCreateByUserId: async (userId) => {
        try {
            const [rows] = await db.query('SELECT * FROM wishlist WHERE user_id = ?', [userId]);
            if (rows.length > 0) {
                return rows[0];
            } else {
                // Tạo wishlist mới
                await db.query('INSERT INTO wishlist (user_id, created_at) VALUES (?, NOW())', [userId]);
                const [newRows] = await db.query('SELECT * FROM wishlist WHERE user_id = ?', [userId]);
                return newRows[0];
            }
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả sản phẩm trong wishlist
    getWishlistItems: async (userId) => {
        try {
            const sql = `
                SELECT wi.id as wishlist_item_id, p.*, c.name AS category_name, b.name AS brand_name
                FROM wishlist_item wi
                INNER JOIN wishlist w ON wi.wishlist_id = w.id
                INNER JOIN products p ON wi.product_id = p.id
                LEFT JOIN category c ON p.category_id = c.id
                LEFT JOIN brand b ON p.brand_id = b.id
                WHERE w.user_id = ?
                ORDER BY wi.id DESC
            `;
            const [rows] = await db.query(sql, [userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Kiểm tra sản phẩm có trong wishlist không
    checkProductInWishlist: async (userId, productId) => {
        try {
            const sql = `
                SELECT wi.id FROM wishlist_item wi
                INNER JOIN wishlist w ON wi.wishlist_id = w.id
                WHERE w.user_id = ? AND wi.product_id = ?
            `;
            const [rows] = await db.query(sql, [userId, productId]);
            return rows.length > 0 ? rows[0].id : null;
        } catch (error) {
            throw error;
        }
    },

    // Thêm sản phẩm vào wishlist
    addToWishlist: async (userId, productId) => {
        try {
            // Lấy hoặc tạo wishlist
            const wishlist = await Wishlist.getOrCreateByUserId(userId);
            
            // Kiểm tra sản phẩm đã có trong wishlist chưa
            const exists = await Wishlist.checkProductInWishlist(userId, productId);
            if (exists) {
                return { success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' };
            }

            // Thêm sản phẩm vào wishlist
            await db.query(
                'INSERT INTO wishlist_item (wishlist_id, product_id) VALUES (?, ?)',
                [wishlist.id, productId]
            );
            return { success: true, message: 'Thêm vào danh sách yêu thích thành công' };
        } catch (error) {
            throw error;
        }
    },

    // Xóa sản phẩm khỏi wishlist
    removeFromWishlist: async (wishlistItemId) => {
        try {
            const [result] = await db.query('DELETE FROM wishlist_item WHERE id = ?', [wishlistItemId]);
            if (result.affectedRows > 0) {
                return { success: true, message: 'Xóa khỏi danh sách yêu thích thành công' };
            } else {
                return { success: false, message: 'Không tìm thấy sản phẩm' };
            }
        } catch (error) {
            throw error;
        }
    },

    // Xóa toàn bộ wishlist của user
    clearWishlist: async (userId) => {
        try {
            const wishlist = await Wishlist.getOrCreateByUserId(userId);
            await db.query('DELETE FROM wishlist_item WHERE wishlist_id = ?', [wishlist.id]);
            return { success: true, message: 'Xóa danh sách yêu thích thành công' };
        } catch (error) {
            throw error;
        }
    },

    // Đếm số sản phẩm trong wishlist
    getWishlistCount: async (userId) => {
        try {
            const sql = `
                SELECT COUNT(*) as count FROM wishlist_item wi
                INNER JOIN wishlist w ON wi.wishlist_id = w.id
                WHERE w.user_id = ?
            `;
            const [rows] = await db.query(sql, [userId]);
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Wishlist;
