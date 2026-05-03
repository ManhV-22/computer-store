const db = require('../config/db'); // Sử dụng trực tiếp db kết nối chuẩn Promise
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// ==========================================
// 1. API ĐĂNG KÝ
// ==========================================
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hashedPassword, 'user', 1] // status = 1 (hoạt động)
        );

        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Lỗi Đăng ký:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

// ==========================================
// 2. API ĐĂNG NHẬP
// ==========================================
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[BACKEND] Đang thử đăng nhập với email: ${email}`);

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }

        const user = rows[0];

        // Kiểm tra tài khoản có bị khóa không
        if (user.status === 0) {
            return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Tạo token thật với JWT
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.status(200).json({ 
                success: true,
                message: "Đăng nhập thành công!",
                token: token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email,
                    role: user.role 
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }
    } catch (error) {
        console.error("Lỗi Đăng nhập:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

// ==========================================
// 3. API LẤY DANH SÁCH USER
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, status FROM users');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi lấy users:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

// ==========================================
// 4. API THAY ĐỔI TRẠNG THÁI (Khóa/Mở User)
// ==========================================
exports.changeStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        console.error("Lỗi đổi trạng thái:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

// ==========================================
// 5. API QUÊN MẬT KHẨU
// ==========================================
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "Email không tồn tại trong hệ thống." });
        }

        const user = results[0];
        const secret = "SECRET_KEY" + user.password; 
        const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: "15m" });

        const resetLink = `http://127.0.0.1:5500/frontend/pages/reset-password.html?id=${user.id}&token=${token}`;

        console.log("----------------------------------------");
        console.log(`[GỬI MAIL ĐẾN: ${user.email}]`);
        console.log(`Link đặt lại mật khẩu của bạn là: \n${resetLink}`);
        console.log("----------------------------------------");

        res.json({ success: true, message: "Đường link đặt lại mật khẩu đã được gửi (Kiểm tra Terminal)." });
    } catch (error) {
        console.error("Lỗi Forgot Password:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

// ==========================================
// 6. API ĐẶT LẠI MẬT KHẨU MỚI
// ==========================================
exports.resetPassword = async (req, res) => {
    const { id, token, newPassword } = req.body;

    try {
        // Đã FIX LỖI: Tìm user theo ID thay vì Email (vì body chỉ gửi lên id, token, newPassword)
        const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "Người dùng không tồn tại" });
        }

        const user = results[0];
        const secret = "SECRET_KEY" + user.password;

        // Xác thực token
        jwt.verify(token, secret);
        
        // Nếu hợp lệ, mã hóa pass mới và lưu DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        
        res.json({ success: true, message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi Reset Password:", error);
        res.status(403).json({ success: false, message: "Đường dẫn không hợp lệ hoặc đã hết hạn!" });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 1)`;
        await db.query(sql, [name, email, hashedPassword, role]);
        res.json({ success: true, message: "Thêm người dùng thành công!" });
    } catch (error) {
        console.error("Lỗi thêm user:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    try {
        const sql = `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`;
        await db.query(sql, [name, email, role, id]);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        console.error("Lỗi sửa user:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Khóa/Mở khóa người dùng (Thay vì xóa hẳn, ta nên đổi status)
exports.toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 0 là khóa, 1 là hoạt động
    try {
        const sql = `UPDATE users SET status = ? WHERE id = ?`;
        await db.query(sql, [status, id]);
        res.json({ success: true, message: "Đổi trạng thái thành công!" });
    } catch (error) {
        console.error("Lỗi khóa user:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};