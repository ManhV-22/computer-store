// const API_URL = 'http://localhost:3000/api'; // Đảm bảo đã khai báo API_URL

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- XỬ LÝ ĐĂNG NHẬP ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
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
                    // Đảm bảo data.user tồn tại trước khi stringify
                    if(data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    
                    alert('Đăng nhập thành công!'); 
                    window.location.href = 'index.html'; // Chuyển sang index cùng thư mục
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                console.error(error); 
                errorMsg.textContent = 'Lỗi kết nối đến máy chủ.';
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- XỬ LÝ ĐĂNG KÝ ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value; 
            const errorMsg = document.getElementById('register-error');

            if (password !== confirmPassword) {
                errorMsg.textContent = 'Mật khẩu xác nhận không khớp!';
                errorMsg.style.display = 'block';
                return; 
            }

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
            if (!passwordRegex.test(password)) {
                errorMsg.textContent = 'Mật khẩu chưa đủ mạnh. Cần >8 ký tự, có chữ hoa, số và ký tự đặc biệt.';
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

    // --- XỬ LÝ QUÊN MẬT KHẨU ---
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const msgEl = document.getElementById('forgot-msg');

            msgEl.style.color = '#333';
            msgEl.textContent = 'Đang xử lý...';
            msgEl.style.display = 'block';

            try {
                const response = await fetch(`${API_URL}/users/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                
                if (response.ok) {
                    msgEl.style.color = 'green';
                    msgEl.textContent = data.message;
                } else {
                    msgEl.style.color = 'red';
                    msgEl.textContent = data.message;
                }
            } catch (error) {
                msgEl.style.color = 'red';
                msgEl.textContent = 'Lỗi kết nối máy chủ.';
            }
        });
    }

    // --- XỬ LÝ ĐẶT LẠI MẬT KHẨU ---
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            const token = urlParams.get('token');
            
            const email = document.getElementById('reset-email').value;
            const newPassword = document.getElementById('reset-new-password').value;
            const confirmPassword = document.getElementById('reset-confirm-password').value;
            const errorMsg = document.getElementById('reset-error');

            if (!id || !token) {
                errorMsg.textContent = 'Đường dẫn không hợp lệ hoặc thiếu thông tin!';
                errorMsg.style.display = 'block';
                return;
            }

            if (newPassword !== confirmPassword) {
                errorMsg.textContent = 'Mật khẩu xác nhận không khớp!';
                errorMsg.style.display = 'block';
                return;
            }

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
            if (!passwordRegex.test(newPassword)) {
                errorMsg.textContent = 'Mật khẩu chưa đủ mạnh!';
                errorMsg.style.display = 'block';
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, token, email, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                    window.location.href = 'login.html';
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                errorMsg.textContent = 'Lỗi kết nối máy chủ.';
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- XỬ LÝ GIAO DIỆN HEADER KHI ĐÃ ĐĂNG NHẬP (MỚI THÊM) ---
    const authMenu = document.getElementById('auth-menu');
    
    if (authMenu) {
        // Lấy thông tin user từ localStorage
        const userString = localStorage.getItem('user');

        if (userString) {
            const user = JSON.parse(userString);
            
            // Ghi đè lại HTML của thẻ div#auth-menu
            authMenu.innerHTML = `
                <span style="margin-right: 15px; font-weight: bold; color: #333;">
                    Chào, ${user.name}
                </span>
                <a href="#" id="logout-btn" style="color: #ef4444; font-weight: bold; text-decoration: none; cursor: pointer;">Đăng xuất</a>
            `;

            // Xử lý sự kiện khi bấm nút Đăng xuất
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Xóa token và user khỏi bộ nhớ
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Tải lại trang (Sẽ tự động hiện lại nút Đăng nhập/Đăng ký)
                    window.location.reload();
                });
            }
        }
    }

    
});
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling; // Lấy thẻ span ngay sau input

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈'; // Đổi icon khi hiện mật khẩu
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️'; // Đổi icon khi ẩn mật khẩu
    }
}