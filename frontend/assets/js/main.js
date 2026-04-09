// assets/js/main.js
const API_URL = 'http://localhost:3000/api'; 
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

// ==========================================
// CHỨC NĂNG GIỎ HÀNG (DÙNG CHUNG TOÀN HỆ THỐNG)
// ==========================================

async function addToCart(productId) {
    // 1. KIỂM TRA ĐĂNG NHẬP (Dùng đúng key 'user' như lúc login)
    const user = localStorage.getItem('user');
    if (!user) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng! 🔒");
        window.location.href = 'login.html';
        return; 
    }

    try {
        // 2. LẤY THÔNG TIN SẢN PHẨM TỪ API
        // Cách này đảm bảo an toàn, trang nào gọi hàm cũng lấy được đúng data
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            const product = result.data.find(p => p.id == productId);
            
            if (!product) {
                alert("Không tìm thấy sản phẩm!");
                return;
            }

            // 3. XỬ LÝ LƯU VÀO LOCALSTORAGE
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id == productId);

            if (existingItem) {
                // Tăng số lượng nếu đã có
                existingItem.quantity += 1; 
            } else {
                // Thêm mới (Đổi thuộc tính thành quantity cho khớp với cart.js)
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            
            // 4. CẬP NHẬT GIAO DIỆN
            updateCartCount();
            alert(`Đã thêm "${product.name}" vào giỏ hàng thành công! 🛒`);
        }
    } catch (error) {
        console.error("Lỗi thêm giỏ hàng:", error);
    }
}

// Hàm cập nhật con số màu đỏ trên icon giỏ hàng
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Tìm tất cả các thẻ có class 'cart-count' trên giao diện và cập nhật số
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.innerText = totalItems;
    });
}

// Chạy cập nhật số lượng giỏ hàng ngay khi load mọi trang
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});