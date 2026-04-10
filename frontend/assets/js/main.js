// assets/js/main.js
const API_URL = 'http://localhost:3000/api'; 

// ==========================================
// TẢI COMPONENT (HEADER / FOOTER CHUNG)
// ==========================================
async function loadComponents() {
    // 1. Kiểm tra xem trang hiện tại có nằm trong folder 'pages' hay không
    // window.location.pathname sẽ trả về đường dẫn file trên trình duyệt
    const isInsidePages = window.location.pathname.includes('/pages/');

    // 2. Thiết lập tiền tố đường dẫn: 
    // Nếu ở trong 'pages', cần '../' để ra ngoài rồi mới vào 'components'
    // Nếu ở ngoài (index.html), chỉ cần './'
    const prefix = isInsidePages ? '../components/' : './components/';

    try {
        // Tải Header
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const res = await fetch(`${prefix}header.html`);
            if (res.ok) {
                headerPlaceholder.innerHTML = await res.text();
            } else {
                console.error("Không tìm thấy file header.html tại:", `${prefix}header.html`);
            }
        }

        // Tải Footer
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const res = await fetch(`${prefix}footer.html`);
            if (res.ok) {
                footerPlaceholder.innerHTML = await res.text();
            }
        }

        // Sau khi nhúng xong HTML, mới bắt đầu chạy logic User và Giỏ hàng
        updateAuthUI();
        updateCartCount();

    } catch (error) {
        console.error("Lỗi thực thi loadComponents:", error);
    }
}

// Chạy tải component ngay khi trang vừa load xong
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

    // Kiểm tra xem chúng ta đang ở trang chủ hay trong thư mục /pages/
    const isInsidePages = window.location.pathname.includes('/pages/');
    const pathPrefix = isInsidePages ? '' : 'pages/';
    // Tiền tố để vào được thư mục admin (từ ngoài hay từ trong pages)
    const adminPrefix = isInsidePages ? '../admin/' : 'admin/';

    if (user && userNameElement) {
        // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ---
        userNameElement.innerText = user.name;
        userNameElement.parentElement.onclick = null; 
        
        if (userDropdown) {
            // Khởi tạo nội dung menu
            let menuHTML = '';

            // KIỂM TRA QUYỀN (Nếu role là 1 = Admin, hoặc text là 'admin', tuỳ bạn cài đặt ở backend)
            // Bạn có thể sửa "user.role === 1" thành điều kiện phù hợp với API của bạn nhé
            if (user.role === 1 || user.role === 'admin') {
                menuHTML += `
                    <a href="${adminPrefix}dashboard.html" style="display: block; padding: 12px 15px; color: #e74c3c; font-weight: bold; text-decoration: none; border-bottom: 1px solid #eee;">
                        ⚙️ Trang Quản Trị
                    </a>
                `;
            }

            // Gắn thêm các nút cơ bản (Đơn hàng, Đăng xuất)
            menuHTML += `
                <a href="${pathPrefix}orders.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">📦 Đơn hàng của tôi</a>
                <a href="#" onclick="logout(); return false;" style="display: block; padding: 12px 15px; color: #d70018; text-decoration: none; font-weight: bold; text-align: center;">🚪 Đăng xuất</a>
            `;

            userDropdown.innerHTML = menuHTML;
        }
    } else if (userNameElement) {
        // --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP ---
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

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    window.location.href = 'login.html';
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

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (cartCountElement) {
        // Render số lượng vào Header mới
        cartCountElement.innerText = totalItems;
    }
}