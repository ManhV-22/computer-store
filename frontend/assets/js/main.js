// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && authSection) {
        // Nếu đã đăng nhập, hiện tên và nút đăng xuất
        authSection.innerHTML = `
            <div class="user-info-wrapper">
                <span class="user-name">👤 ${user.name}</span>
                <a href="#" onclick="logout()" class="logout-btn">Đăng xuất</a>
            </div>
            <a href="cart.html" class="cart-btn">
                Giỏ hàng <br><span class="cart-count">0</span> Sản phẩm
            </a>
        `;
        // Sau này sẽ gọi hàm updateCartCount() ở đây
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload(); // Tải lại trang để cập nhật UI
}