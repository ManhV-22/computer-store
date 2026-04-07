const db = require('../config/db');

const Product = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM products WHERE status = 1');
        return rows;
    }
};

module.exports = Product;