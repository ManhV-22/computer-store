const db = require('../config/db');

const Review = {
    getByProductId: async (productId) => {
        const [rows] = await db.query(
            `SELECT r.*, u.name AS user_name, u.email AS user_email
             FROM review r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows;
    },

    add: async (productId, userId, rating, comment) => {
        const [result] = await db.query(
            `INSERT INTO review (product_id, user_id, rating, comment, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [productId, userId, rating, comment]
        );
        return result.insertId;
    },

    getAverageRating: async (productId) => {
        const [rows] = await db.query(
            `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
             FROM review
             WHERE product_id = ?`,
            [productId]
        );
        return rows[0] || { avg_rating: 0, total_reviews: 0 };
    }
};

module.exports = Review;
