const mysql = require('mysql2/promise'); // BẮT BUỘC PHẢI CÓ /promise ở đây

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Để trống nếu dùng XAMPP mặc định
    database: 'computer_store',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;