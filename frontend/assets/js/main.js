// assets/js/main.js
window.API_URL = 'http://localhost:3000/api';

// ==========================================
// HÀM HIỂN THỊ THÔNG BÁO GIỮA MÀN HÌNH (THAY THẾ ALERT)
// ==========================================
window.showNotification = function(message, type = 'success') {
    // Xóa thông báo cũ nếu đang hiện
    const existingToast = document.getElementById('custom-toast-notification');
    if (existingToast) existingToast.remove();

    // Tạo thẻ div chứa thông báo
    const toast = document.createElement('div');
    toast.id = 'custom-toast-notification';
    
    // Đặt màu sắc tùy theo loại thông báo
    const bgColor = type === 'success' ? '#2ecc71' : '#e74c3c'; // Xanh lá cho thành công, Đỏ cho lỗi

    // CSS cho thông báo hiện giữa màn hình
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: ${bgColor};
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none;
    `;

    toast.innerHTML = message;
    document.body.appendChild(toast);

    // Hiệu ứng Fade-in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Tự động Fade-out và xóa đi sau 2 giây
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 300); // Đợi CSS transition chạy xong mới remove
    }, 2000);
};

// ==========================================
// TẢI COMPONENT (HEADER / FOOTER CHUNG)
// ==========================================
async function loadComponents() {
    const isInsidePages = window.location.pathname.includes('/pages/');
    const prefix = isInsidePages ? '../components/' : './components/';

    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const res = await fetch(`${prefix}header.html`);
            if (res.ok) {
                headerPlaceholder.innerHTML = await res.text();
            } else {
                console.error("Không tìm thấy file header.html tại:", `${prefix}header.html`);
            }
        }

        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const res = await fetch(`${prefix}footer.html`);
            if (res.ok) {
                footerPlaceholder.innerHTML = await res.text();
            }
        }

        updateAuthUI();
        updateCartCount();
        updateWishlistCount();

    } catch (error) {
        console.error("Lỗi thực thi loadComponents:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});

// ==========================================
// CHỨC NĂNG TÀI KHOẢN (AUTH)
// ==========================================
function updateAuthUI() {
    const userNameElement = document.getElementById('header-user-name');
    const userDropdown = document.getElementById('user-dropdown');
    const user = JSON.parse(localStorage.getItem('user'));

    const isInsidePages = window.location.pathname.includes('/pages/');
    const pathPrefix = isInsidePages ? '' : 'pages/';
    const adminPrefix = isInsidePages ? '../admin/' : 'admin/';

    if (user && userNameElement) {
        userNameElement.innerText = user.name;
        userNameElement.parentElement.onclick = null; 
        
        if (userDropdown) {
            let menuHTML = '';

            if (user.role === 1 || user.role === 'admin') {
                menuHTML += `
                    <a href="${adminPrefix}dashboard.html" style="display: block; padding: 12px 15px; color: #e74c3c; font-weight: bold; text-decoration: none; border-bottom: 1px solid #eee;">
                        ⚙️ Trang Quản Trị
                    </a>
                `;
            }

            menuHTML += `
                <a href="${pathPrefix}orders.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">📦 Đơn hàng của tôi</a>
                <a href="#" onclick="logout(); return false;" style="display: block; padding: 12px 15px; color: #d70018; text-decoration: none; font-weight: bold; text-align: center;">🚪 Đăng xuất</a>
            `;

            userDropdown.innerHTML = menuHTML;
        }
    } else if (userNameElement) {
        userNameElement.innerText = "Đăng nhập";
        
        userNameElement.parentElement.onclick = () => {
            window.location.href = isInsidePages ? 'login.html' : 'pages/login.html';
        };
        
        if (userDropdown) {
            userDropdown.innerHTML = `
                <a href="${pathPrefix}login.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">Đăng nhập</a>
                <a href="${pathPrefix}register.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none;">Đăng ký</a>
            `;
        }
    }
}

window.logout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    
    const isInsidePages = window.location.pathname.includes('/pages/');
    window.location.href = isInsidePages ? 'login.html' : 'pages/login.html';
}

// ==========================================
// CHỨC NĂNG GIỎ HÀNG (DÙNG CHUNG TOÀN HỆ THỐNG)
// ==========================================
window.addToCart = async function(productId, isBuyNow = false) {
    const isInsidePages = window.location.pathname.includes('/pages/');
    const loginPath = isInsidePages ? 'login.html' : 'pages/login.html';

    const user = localStorage.getItem('user');
    if (!user) {
        showNotification("🔒 Vui lòng đăng nhập để thao tác!", "error");
        setTimeout(() => {
            window.location.href = loginPath;
        }, 1500);
        return false; 
    }

    try {
        const response = await fetch(`${window.API_URL}/products`);
        const result = await response.json();
        
        if (response.ok) {
            // Lấy danh sách sản phẩm giống hệt cách home.js làm
            const productsList = result.data || result; 
            
            // Tìm sản phẩm trong mảng
            const product = Array.isArray(productsList) ? productsList.find(p => p.id == productId) : null;
            
            if (!product) {
                showNotification("❌ Không tìm thấy sản phẩm trong hệ thống!", "error");
                return false;
            }

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id == productId);

            if (existingItem) {
                existingItem.quantity += 1; 
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.updateCartCount();
            
            if (!isBuyNow) {
                showNotification(`🛒 Đã thêm <b>${product.name}</b> vào giỏ hàng!`, "success");
            }
            return true;
        } else {
            showNotification("❌ Lỗi API: Máy chủ phản hồi thất bại!", "error");
            return false;
        }
    } catch (error) {
        console.error("Lỗi thêm giỏ hàng:", error);
        showNotification("❌ Không kết nối được với Server!", "error");
        return false;
    }
}

// HÀM MUA NGAY 
window.buyNow = async function(productId) {
    const success = await window.addToCart(productId, true);
    
    if (success) {
        const isInsidePages = window.location.pathname.includes('/pages/');
        window.location.href = isInsidePages ? 'cart.html' : 'pages/cart.html';
    }
}

window.updateCartCount = function() {
    const cartCountElement = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (cartCountElement) {
        cartCountElement.innerText = totalItems;
        // Ẩn số đi nếu giỏ hàng trống cho giao diện sạch sẽ
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

window.updateWishlistCount = function() {
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (!wishlistCountElement) return;
    
    // Lấy user ID từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user.user_id;
    
    if (!userId) {
        wishlistCountElement.style.display = 'none';
        return;
    }
    
    // Gọi API lấy số lượng wishlist
    fetch(`${window.API_URL}/wishlist/count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userId
        }
    })
    .then(response => response.json())
    .then(data => {
        const count = data.count || 0;
        wishlistCountElement.innerText = count;
        wishlistCountElement.style.display = count > 0 ? 'inline-block' : 'none';
    })
    .catch(error => {
        console.error('Lỗi cập nhật số lượng wishlist:', error);
        wishlistCountElement.style.display = 'none';
    });
}