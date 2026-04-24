// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- HÀM KIỂM TRA ĐỊNH DẠNG EMAIL ---
    const isValidEmail = (email) => {
        // Regex kiểm tra định dạng email tiêu chuẩn (phải có @ và tên miền)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // --- XỬ LÝ ĐĂNG KÝ ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorMsg = document.getElementById('register-error');

            // 1. Kiểm tra định dạng email
            if (!isValidEmail(email)) {
                errorMsg.textContent = 'Định dạng email không hợp lệ (Ví dụ: abc@gmail.com)!';
                errorMsg.style.display = 'block';
                return;
            }

            // 2. Kiểm tra khớp mật khẩu
            if (password !== confirmPassword) {
                errorMsg.textContent = 'Mật khẩu xác nhận không khớp!';
                errorMsg.style.display = 'block';
                return;
            }

            // 3. Kiểm tra độ mạnh mật khẩu (>8 ký tự, 1 hoa, 1 số, 1 đặc biệt)
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                errorMsg.textContent = 'Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt.';
                errorMsg.style.display = 'block';
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    window.location.href = 'login.html';
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                errorMsg.textContent = 'Lỗi kết nối đến máy chủ.';
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- XỬ LÝ ĐĂNG NHẬP ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('login-error');

            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Lưu dữ liệu vào localStorage
                    localStorage.setItem('token', data.token);
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));

                        alert(`Chào mừng ${data.user.name} trở lại!`);

                        // PHÂN QUYỀN CHUYỂN HƯỚNG
                        if (data.user.role === 'admin' || data.user.role === 'employee') {
                            // Sử dụng đường dẫn đầy đủ từ gốc server để tránh trình duyệt tự nối thêm "pages/"
                            window.location.href = '/frontend/admin/dashboard.html'; 
                        } else {
                            // Về trang chủ của người dùng
                            window.location.href = 'index.html';
                        }
                    }
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                errorMsg.textContent = 'Lỗi kết nối đến máy chủ.';
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- XỬ LÝ GIAO DIỆN HEADER (ẨN/HIỆN NÚT ĐĂNG NHẬP) ---
    const authMenu = document.getElementById('auth-menu');
    if (authMenu) {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            authMenu.innerHTML = `
                <span style="margin-right: 15px; font-weight: bold; color: #333;">
                    Chào, ${user.name}
                </span>
                <a href="#" id="logout-btn" style="color: #ef4444; font-weight: bold; text-decoration: none;">Đăng xuất</a>
            `;

            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/frontend/pages/login.html'; // Về trang login
            });
        }
    }
});

// Hàm hiển thị/ẩn mật khẩu
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}