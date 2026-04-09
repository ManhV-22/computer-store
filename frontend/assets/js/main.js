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

    if (user && userNameElement) {
        // Đã đăng nhập
        userNameElement.innerText = user.name;
        userNameElement.parentElement.onclick = null; // Bỏ sự kiện click chuyển sang login
        
        // Thêm nút Đăng xuất vào dropdown
        if (userDropdown) {
            userDropdown.innerHTML = `<a href="#" onclick="logout(); return false;" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-top: 1px solid #eee; background: #fff; text-align: center; font-weight: bold;">Đăng xuất</a>`;
        }
    } else if (userNameElement) {
        // Chưa đăng nhập
        userNameElement.innerText = "Đăng nhập";
        
        // Bấm vào chữ Đăng nhập sẽ chuyển trang
        userNameElement.parentElement.onclick = () => {
            window.location.href = 'login.html';
        };
        
        if (userDropdown) userDropdown.innerHTML = ''; 
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