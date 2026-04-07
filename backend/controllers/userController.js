// userController.js
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  User.findByEmail(email, async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      status: true
    };

    User.create(newUser, (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Đăng ký thành công" });
    });
  });
};

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi máy chủ" });
        
        // 1. Kiểm tra xem email có tồn tại không
        if (results.length === 0) {
            return res.status(400).json({ message: "Sai email hoặc mật khẩu!" });
        }

        const user = results[0];

        // 2. Dùng bcrypt để so sánh mật khẩu người dùng nhập vào với mật khẩu băm trong DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Nếu không khớp, trả về lỗi 400 và dòng thông báo
            return res.status(400).json({ message: "Sai email hoặc mật khẩu!" });
        }

        // 3. Nếu đúng mật khẩu thì cho phép đăng nhập thành công
        // (Giả sử bạn trả về token và thông tin user)
        res.status(200).json({
            message: "Đăng nhập thành công",
            token: "fake-jwt-token", // Hoặc token thật nếu bạn dùng jsonwebtoken
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
};
exports.changeStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  User.updateStatus(id, status, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cập nhật trạng thái thành công" });
  });
};


// [POST] Quên mật khẩu
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại trong hệ thống." });
    }

    const user = results[0];

    // Tạo token đặc biệt chỉ sống trong 15 phút, kết hợp mật khẩu cũ vào secret để đảm bảo token chết ngay khi pass đổi
    const secret = "SECRET_KEY" + user.password; 
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: "15m" });

    // Tạo đường link reset (Giả sử frontend của bạn chạy ở localhost:5500 hoặc mở trực tiếp file)
    // Nếu bạn xài Live Server VSCode, port thường là 5500. Hãy thay đổi cho khớp.
    const resetLink = `http://127.0.0.1:5500/frontend/pages/reset-password.html?id=${user.id}&token=${token}`;

    console.log("----------------------------------------");
    console.log(`[GỬI MAIL ĐẾN: ${user.email}]`);
    console.log(`Link đặt lại mật khẩu của bạn là: \n${resetLink}`);
    console.log("----------------------------------------");

    res.json({ message: "Đường link đặt lại mật khẩu đã được gửi (Vui lòng kiểm tra Terminal Backend)." });
  });
};

// [POST] Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  const { id, token, newPassword } = req.body;

  User.findByEmail(req.body.email, async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: "Người dùng không tồn tại" });

    const user = results[0];
    const secret = "SECRET_KEY" + user.password;

    try {
      // Xác thực token
      jwt.verify(token, secret);
      
      // Nếu hợp lệ, mã hóa pass mới và lưu DB
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      User.updatePassword(user.id, hashedPassword, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Đặt lại mật khẩu thành công!" });
      });
    } catch (error) {
      res.status(403).json({ message: "Đường dẫn không hợp lệ hoặc đã hết hạn!" });
    }
  });
};