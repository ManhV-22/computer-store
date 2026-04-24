document.addEventListener('DOMContentLoaded', () => {
    
    // Luôn load sidebar
    loadAdminSidebar();
    

    // Phân luồng load dữ liệu theo trang hiện tại
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/') {
        loadHomeData();
    }
    if (path.includes('dashboard.html')) {
        loadDashboardStats();
    }
    if (path.includes('system.html')) {
        loadSystemDashboard();
    }
    if (path.includes('categories.html')) {
        loadCategories();
    }
    if (path.includes('products.html')) {
        loadAdminProducts();
        loadDropdownData();
        if (typeof window.setupProductForm === 'function') window.setupProductForm();
    }
    
    // const userTable = document.getElementById('admin-user-list');
    
   if (path.includes('users.html')) {
        if (typeof loadUsers === 'function') loadUsers();
    }

    setTimeout(() => {
        loadMegaMenu();
    }, 100); 

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');
    const brandId = urlParams.get('brand');

    // 2. Gọi hàm tải sản phẩm với các tham số này
    loadProducts({ categoryId, brandId });
    
    // 3. Lắng nghe sự kiện thay đổi giá
    document.getElementById('filter-price')?.addEventListener('change', function() {
        filterProducts();
    });


    // 1. Khởi tạo Sidebar & Menu (Dùng chung cho các trang)
    if (typeof loadAdminSidebar === 'function') loadAdminSidebar();
    
    setTimeout(() => {
        if (typeof loadMegaMenu === 'function') loadMegaMenu();
    }, 100); 

    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        if (typeof loadHomeData === 'function') loadHomeData();
    }
    
    if (path.includes('products.html')) {
        // Lấy params từ URL để lọc ngay khi vào trang
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        const brandId = urlParams.get('brand');
        
        if (typeof loadProducts === 'function') {
            loadProducts({ categoryId, brandId });
        }
        
        // Lắng nghe sự kiện lọc tại trang sản phẩm
        document.getElementById('filter-price')?.addEventListener('change', filterProducts);
        document.getElementById('sort-price')?.addEventListener('change', filterProducts);
    }

    // Các trang Admin khác
    if (path.includes('dashboard.html')) loadDashboardStats?.();
    if (path.includes('system.html')) loadSystemDashboard?.();
    if (path.includes('categories.html')) loadCategories?.();

    // 3. Xử lý Tìm kiếm (Dùng chung cho toàn bộ trang web)
    const searchInput = document.querySelector('.search-box input');
    const searchIcon = document.querySelector('.search-box i');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(searchInput.value);
        });
    }

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', () => performSearch(searchInput.value));
    }

    // 4. Xử lý Chatbot
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }
});

async function loadMegaMenu() {
    // Lấy đúng 2 thẻ UL theo ID trong HTML bạn gửi
    const catUl = document.getElementById('menu-categories');
    const brandUl = document.getElementById('menu-brands');

    try {
        // 1. Gọi API đồng thời để tiết kiệm thời gian
        const [resCat, resBrand] = await Promise.all([
            fetch('http://localhost:3000/api/categories'),
            fetch('http://localhost:3000/api/brands')
        ]);

        // 2. Chuyển đổi dữ liệu
        const categories = await resCat.json();
        const brands = await resBrand.json();

        // 3. Đổ dữ liệu Danh mục (Vì dữ liệu bạn gửi là mảng trực tiếp [])
        if (catUl) {
            if (Array.isArray(categories) && categories.length > 0) {
                catUl.innerHTML = categories.map(cat => 
                    `<li><a href="products.html?category=${cat.id}">${cat.name}</a></li>`
                ).join('');
            } else {
                catUl.innerHTML = '<li><a href="#">Không có danh mục</a></li>';
            }
        }

        // 4. Đổ dữ liệu Thương hiệu
        if (brandUl) {
            if (Array.isArray(brands) && brands.length > 0) {
                // Lọc những thương hiệu có status = 1 (đang hoạt động)
                brandUl.innerHTML = brands
                    .filter(b => b.status == 1) 
                    .map(brand => 
                        `<li><a href="products.html?brand=${brand.id}">${brand.name}</a></li>`
                    ).join('');
            } else {
                brandUl.innerHTML = '<li><a href="#">Không có thương hiệu</a></li>';
            }
        }

    } catch (error) {
        console.error("Lỗi khi tải Menu:", error);
        if (catUl) catUl.innerHTML = '<li style="color:red;">Lỗi kết nối server</li>';
    }
}

async function loadHomeData() {
    try {
        const resBrand = await fetch('http://localhost:3000/api/brands');
        const brands = await resBrand.json();

        const homeBrandGrid = document.getElementById('dynamic-brand-grid');
        if (homeBrandGrid && Array.isArray(brands)) {
            homeBrandGrid.innerHTML = brands.filter(b => b.status == 1).map(brand => {
                
                // XỬ LÝ ĐƯỜNG DẪN ẢNH TẠI ĐÂY
                let imgUrl = brand.image; 
                
                // Nếu đường dẫn không bắt đầu bằng http và không có ../ thì thêm vào
                if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('../')) {
                    imgUrl = `../${imgUrl}`; 
                }

                return `
                    <div class="brand-item-card" onclick="location.href='products.html?brand=${brand.id}'">
                        <img src="${imgUrl}" 
                             alt="${brand.name}" 
                             onerror="this.src='../assets/img/brands/default.png'">
                        <span>${brand.name}</span>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Lỗi loadHomeData:", error);
    }
}
// --- HÀM HỖ TRỢ GIAO DIỆN ---

function loadAdminSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    sidebarContainer.innerHTML = `
        <div class="admin-sidebar">
            <div class="sidebar-logo">
                <h3>🖥️ Computer Store</h3>
            </div>
            <ul class="sidebar-menu">
                <li><a href="system.html" id="nav-system"><i class="fas fa-server"></i> Hệ thống</a></li> 
                <li><a href="dashboard.html" id="nav-dashboard"><i class="fas fa-home"></i> Tổng quan</a></li>
                <li><a href="settings.html" id="nav-settings"><i class="fas fa-cog"></i> Cấu hình</a></li> 
                <li><a href="categories.html" id="nav-categories"><i class="fas fa-tags"></i> Danh mục</a></li>
                
                <li><a href="brands.html" id="nav-brands"><i class="fas fa-award"></i> Thương hiệu</a></li>
                
                <li><a href="products.html" id="nav-products"><i class="fas fa-laptop"></i> Sản phẩm</a></li>
                <li><a href="users.html" id="nav-users"><i class="fas fa-users"></i> Người dùng</a></li>
                <li><a href="orders.html" id="nav-orders"><i class="fas fa-shopping-cart"></i> Đơn hàng</a></li>
                <li><a href="reports.html" id="nav-reports"><i class="fas fa-chart-bar"></i> Báo cáo</a></li>
                <li class="menu-divider"></li>
                <li><a href="/frontend/pages/index.html"><i class="fas fa-external-link-alt"></i> Xem cửa hàng</a></li>
                <li><a href="#" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a></li>
            </ul>
        </div>
    `;
    
    // Logic nhận diện trang hiện tại
    const currentPath = window.location.pathname;
    const navMapping = {
        'system.html': 'nav-system',
        'dashboard.html': 'nav-dashboard',
        'settings.html': 'nav-settings',
        'categories.html': 'nav-categories',
        'brands.html': 'nav-brands', // ĐÃ THÊM KEY NÀY ĐỂ KÍCH HOẠT MENU ACTIVE
        'products.html': 'nav-products',
        'users.html': 'nav-users',
        'orders.html': 'nav-orders',
        'reports.html': 'nav-reports'
    };

    // Xóa tất cả active cũ (nếu có) và gán active mới
    Object.keys(navMapping).forEach(page => {
        if (currentPath.includes(page)) {
            document.getElementById(navMapping[page])?.classList.add('active');
        }
    });
}
// --- LOGIC TRANG TỔNG QUAN (DASHBOARD) ---

async function loadDashboardStats() {
    try {
        const [resProds, resOrders, resUsers] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/orders`),
            fetch(`${API_URL}/users`)
        ]);

        const products = await resProds.json();
        const orders = await resOrders.json();
        const users = await resUsers.json();

        const prodData = Array.isArray(products) ? products : (products.data || []);
        const orderData = Array.isArray(orders) ? orders : (orders.data || []);
        const userData = Array.isArray(users) ? users : (users.data || []);

        // Đổ số liệu vào Card (Giữ nguyên phần này của bạn)
        if (document.getElementById('total-products')) document.getElementById('total-products').innerText = prodData.length;
        if (document.getElementById('total-users')) document.getElementById('total-users').innerText = userData.length;
        if (document.getElementById('total-orders')) document.getElementById('total-orders').innerText = orderData.length;
        if (document.getElementById('total-revenue')) {
            const revenue = orderData.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
            document.getElementById('total-revenue').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue);
        }

        // --- PHẦN MỚI: Đổ dữ liệu vào bảng ---
        const orderTable = document.getElementById('recent-orders-list');
if (orderTable) {
    if (orderData.length === 0) {
        orderTable.innerHTML = `<tr><td colspan="5" class="text-center">Chưa có đơn hàng nào</td></tr>`;
    } else {
        orderTable.innerHTML = orderData.slice(0, 5).map(order => {
            // Định nghĩa màu sắc cho từng trạng thái
            const statusMap = {
                'pending': { label: 'Chờ xử lý', class: 'stt-pending' },
                'shipping': { label: 'Đang giao', class: 'stt-shipping' },
                'completed': { label: 'Hoàn thành', class: 'stt-success' },
                'cancelled': { label: 'Đã hủy', class: 'stt-danger' }
            };
            const status = statusMap[order.status.toLowerCase()] || { label: order.status, class: '' };

            return `
                <tr>
                    <td style="font-weight: 600; color: #2c3e50;">#${order.id}</td>
                    <td>
                        <div class="customer-info">
                            <i class="fas fa-user-circle"></i> ${order.customer_name || 'Khách hàng #' + order.user_id}
                        </div>
                    </td>
                    <td><i class="far fa-calendar-alt"></i> ${new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td style="font-weight: bold; color: #e74c3c;">${new Intl.NumberFormat('vi-VN').format(order.total_price)}đ</td>
                    <td><span class="status-badge ${status.class}">${status.label}</span></td>
                </tr>
            `;
        }).join('');
    }
}
    } catch (error) {
        console.error("Lỗi tải thống kê:", error);
    }
}
// --- LOGIC QUẢN LÝ DANH MỤC ---

async function loadCategories() {
    const tableBody = document.getElementById('category-list');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/categories`);
        const result = await res.json();
        const data = Array.isArray(result) ? result : (result.data || []);

        tableBody.innerHTML = data.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td><strong>${cat.name}</strong></td>
                <td><span class="badge ${cat.status === 'active' || cat.status == 1 ? 'status-active' : 'status-locked'}">
                    ${cat.status === 'active' || cat.status == 1 ? 'Hoạt động' : 'Đang ẩn'}
                </span></td>
                <td style="text-align: right;">
                    <button onclick="editCategory(${cat.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCategory(${cat.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
    }
}

// --- LOGIC QUẢN LÝ SẢN PHẨM ---

async function loadAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const result = await res.json();
        const products = Array.isArray(result) ? result : (result.data || []);
        
        list.innerHTML = products.map(item => {
            const allImages = item.image ? item.image.split(',') : [];
            const safeImageString = (item.image || '').replace(/'/g, "\\'");
            
            const statusBadge = (item.status == 1)
                ? '<span style="color: green; background: #e8f5e9; padding: 2px 8px; border-radius: 4px;">Đang bán</span>' 
                : '<span style="color: red; background: #ffebee; padding: 2px 8px; border-radius: 4px;">Tạm ngưng</span>';

            return `
                <tr>
                    <td>${item.id}</td>
                    <td class="text-center">
                        <img src="../assets/img/products/${allImages[0] || 'default.jpg'}" class="admin-img-thumb" onerror="this.src='../assets/img/products/default.jpg'">
                    </td>
                    <td>
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 11px; color: #7f8c8d;">${item.category_name || 'N/A'}</div>
                    </td>
                    <td style="color: #e74c3c; font-weight: bold;">${Number(item.price).toLocaleString('vi-VN')}đ</td>
                    <td>${item.quantity}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="editProduct(${item.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct(${item.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        }).join('');
    } catch (err) { 
        console.error("Lỗi tải sản phẩm:", err); 
    }
}

// --- HÀM BỔ TRỢ KHÁC ---

async function loadDropdownData() {
    try {
        const [resCat, resBrand] = await Promise.all([
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/brands`)
        ]);
        
        const categories = await resCat.json();
        const brands = await resBrand.json();

        // 1. Xử lý đổ dữ liệu Danh mục
        const catSelect = document.getElementById('p-category');
        if (catSelect) {
            const dataCat = Array.isArray(categories) ? categories : (categories.data || []);
            catSelect.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
                dataCat.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }

        // 2. Xử lý đổ dữ liệu Thương hiệu (Phần bổ sung)
        const brandSelect = document.getElementById('p-brand');
        if (brandSelect) {
            const dataBrand = Array.isArray(brands) ? brands : (brands.data || []);
            brandSelect.innerHTML = '<option value="">-- Chọn thương hiệu --</option>' + 
                dataBrand.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }
        
    } catch (err) { 
        console.error("Lỗi load dropdown:", err); 
    }
}
function handleLogout() {
    if(confirm("Bạn muốn đăng xuất?")) {
        localStorage.removeItem('adminToken'); // Nếu có dùng token
        window.location.href = "../pages/login.html";
    }
}

// admin.js

async function loadSystemStatus() {
    const systemContainer = document.getElementById('system-details');
    if (!systemContainer) return;

    try {
        const res = await fetch(`${API_URL}/system/status`);
        const result = await res.json();

        if (result.success) {
            const info = result.data;
            systemContainer.innerHTML = `
                <div class="system-grid">
                    <div class="system-card">
                        <label>Hệ điều hành:</label>
                        <span>${info.platform} (${info.arch})</span>
                    </div>
                    <div class="system-card">
                        <label>Bộ vi xử lý (CPU):</label>
                        <span>${info.cpuModel}</span>
                    </div>
                    <div class="system-card">
                        <label>Bộ nhớ (RAM):</label>
                        <span>Trống ${info.freeMemory} / Tổng ${info.totalMemory}</span>
                    </div>
                    <div class="system-card">
                        <label>Node.js Version:</label>
                        <span>${info.nodeVersion}</span>
                    </div>
                    <div class="system-card">
                        <label>Thời gian hoạt động:</label>
                        <span>${info.uptime}</span>
                    </div>
                    <div class="system-card">
                        <label>Trạng thái Database:</label>
                        <span class="status-online"><i class="fas fa-check-circle"></i> ${info.dbStatus}</span>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Lỗi tải thông tin hệ thống:", error);
        systemContainer.innerHTML = `<p class="text-danger">Không thể kết nối với máy chủ hệ thống.</p>`;
    }
}


async function loadSystemDashboard() {
    try {
        const response = await fetch(`${window.API_URL}/system/status`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // Đổ dữ liệu vào các ID đã tạo ở bước 2
            if (document.getElementById('sys-uptime-status')) 
                document.getElementById('sys-uptime-status').innerText = `Uptime: ${data.uptime}h`;
            
            if (document.getElementById('sys-node-version'))
                document.getElementById('sys-node-version').innerText = `Node.js: ${data.nodeVersion}`;

            if (document.getElementById('sys-db-status'))
                document.getElementById('sys-db-status').innerText = data.dbStatus;

            if (document.getElementById('sys-platform'))
                document.getElementById('sys-platform').innerText = `OS: ${data.platform} (${data.arch})`;

            if (document.getElementById('sys-ram-usage'))
                document.getElementById('sys-ram-usage').innerText = data.ramUsage;

            if (document.getElementById('sys-cpu-model'))
                document.getElementById('sys-cpu-model').innerText = data.cpuModel;
        }
    } catch (error) {
        console.error("Không thể load thông tin hệ thống:", error);
    }
}



// Hàm xử lý riêng cho nút làm mới
async function refreshSystemData() {
    const icon = document.getElementById('refresh-icon');
    
    // 1. Hiệu ứng xoay icon (cho người dùng biết đang load)
    if (icon) icon.classList.add('fa-spin');
    
    // 2. Gọi lại hàm load dữ liệu chính
    // Đảm bảo loadSystemDashboard đã được định nghĩa trong file này
    await loadSystemDashboard();
    
    // 3. Dừng xoay sau 0.5s để tạo cảm giác mượt mà
    setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
    }, 500);
}

// CƯỠNG ÉP đưa hàm ra phạm vi toàn cục để HTML onclick nhận được
window.refreshSystemData = refreshSystemData;
window.loadSystemDashboard = loadSystemDashboard;

async function saveWebSettings() {
    const configs = [
        { key: 'main_banners', value: document.getElementById('set-main-banners').value },
        { key: 'sub_banner_1', value: document.getElementById('set-sub-1').value },
        { key: 'sub_banner_2', value: document.getElementById('set-sub-2').value },
        { key: 'flash_sale_end', value: document.getElementById('set-flash-sale').value.replace('T', ' ') }
    ];

    try {
        const response = await fetch(`${window.API_URL}/settings/update-configs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configs })
        });
        const result = await response.json();
        if (result.success) {
            alert("Đã lưu thay đổi! Hãy ra trang chủ để kiểm tra.");
        }
    } catch (error) {
        console.error("Lỗi lưu cấu hình:", error);
    }
}

// Hiển thị ảnh xem trước khi chọn file
document.getElementById('banner-upload')?.addEventListener('change', function() {
    const preview = document.getElementById('preview-banners');
    preview.innerHTML = "";
    
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = "100px";
            img.style.height = "60px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "4px";
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
});

// Gửi file lên Server
async function uploadNewBanners() {
    const fileInput = document.getElementById('banner-upload');
    if (fileInput.files.length === 0) return alert("Vui lòng chọn ít nhất 1 ảnh");

    const formData = new FormData();
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append("banners", fileInput.files[i]);
    }

    try {
        const response = await fetch(`${window.API_URL}/settings/upload-banners`, {
            method: 'POST',
            body: formData // Không set Content-Type, để trình duyệt tự xử lý Boundary
        });
        const result = await response.json();
        if (result.success) {
            alert("Đã cập nhật Banner thành công!");
            location.reload(); // Load lại để thấy thay đổi
        }
    } catch (error) {
        console.error("Lỗi upload:", error);
    }
}

// Định nghĩa hàm để khởi tạo các sự kiện cho Form sản phẩm
window.setupProductForm = function() {
    const productForm = document.getElementById('add-product-form');
    if (productForm) {
        productForm.onsubmit = function(e) {
            e.preventDefault(); // Ngăn trang web tải lại
            window.saveProduct(); // Gọi hàm lưu
        };
    }
};

window.openAddModal = function() {
    // 1. Reset ID đang sửa về null (để hàm saveProduct hiểu là đang THÊM MỚI)
    currentEditId = null; 

    // 2. Tìm form và xóa sạch dữ liệu cũ
    const form = document.getElementById('add-product-form');
    if (form) {
        form.reset();
    }

    // 3. Đưa tiêu đề Modal và nút bấm về trạng thái Thêm mới
    document.querySelector('#productModal h3').innerText = "📦 Thêm sản phẩm mới";
    document.querySelector('.btn-save').innerText = "Lưu sản phẩm";

    // 4. Hiển thị Modal
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    // 5. Load lại dữ liệu Danh mục/Thương hiệu (nếu cần)
    if (typeof loadDropdownData === 'function') {
        loadDropdownData();
    }
};

// Hàm đóng modal cũng nên làm tương tự
window.closeModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Biến dùng chung để lưu ID sản phẩm đang được sửa
let currentEditId = null; 

window.editProduct = async function(id) {
    currentEditId = id; // Gán ID để hàm saveProduct biết là đang sửa
    try {
        const response = await fetch(`${window.API_URL}/products/${id}`);
        const p = await response.json();

        // Đổ dữ liệu vào các ô input trong Modal
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-quantity').value = p.quantity;
        document.getElementById('p-category').value = p.category_id;
        document.getElementById('p-brand').value = p.brand_id;
        document.getElementById('p-status').value = p.status;
        document.getElementById('p-description').value = p.description;
        
        // Cập nhật trạng thái checkbox Nổi bật (is_featured)
        document.getElementById('p-featured').checked = (p.is_featured == 1);

        // Đổi giao diện Modal sang chế độ Chỉnh sửa
        document.querySelector('#productModal h3').innerText = "📝 Chỉnh sửa sản phẩm";
        document.querySelector('.btn-save').innerText = "Cập nhật sản phẩm";
        
        // Hiển thị Modal
        document.getElementById('productModal').style.display = 'flex';
    } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm:", error);
        alert("Không thể lấy dữ liệu sản phẩm!");
    }
};

window.deleteProduct = async function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        try {
            const response = await fetch(`${window.API_URL}/products/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                alert("Xóa thành công!");
                loadAdminProducts(); // Tải lại bảng dữ liệu
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
    }
};
window.editProduct = async function(id) {
    currentEditId = id; // Lưu ID đang sửa vào biến toàn cục
    try {
        const response = await fetch(`${window.API_URL}/products/${id}`);
        const p = await response.json();

        // Đổ dữ liệu vào các input
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-quantity').value = p.quantity;
        document.getElementById('p-category').value = p.category_id;
        document.getElementById('p-brand').value = p.brand_id;
        document.getElementById('p-status').value = p.status;
        document.getElementById('p-description').value = p.description;
        
        // Xử lý checkbox is_featured
        document.getElementById('p-featured').checked = (p.is_featured == 1);

        // Đổi tiêu đề Modal
        document.querySelector('#productModal h3').innerText = "📝 Chỉnh sửa sản phẩm";
        document.querySelector('.btn-save').innerText = "Cập nhật";
        
        // Mở Modal
        document.getElementById('productModal').style.display = 'flex';
    } catch (err) {
        alert("Không thể lấy thông tin sản phẩm!");
    }
};

window.saveProduct = async function() {
    const btnSave = document.querySelector('.btn-save');
    const isFeatured = document.getElementById('p-featured').checked ? 1 : 0;
    
    // Lấy dữ liệu
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const quantity = document.getElementById('p-quantity').value;
    const category_id = document.getElementById('p-category').value;
    const brand_id = document.getElementById('p-brand').value;
    const status = document.getElementById('p-status').value;
    const description = document.getElementById('p-description').value;

    // Kiểm tra bắt buộc
    if (!name || !price || !category_id || !brand_id) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
    }

    // Đóng gói dữ liệu
    const formData = new FormData();
    formData.append('is_featured', isFeatured);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('category_id', category_id);
    formData.append('brand_id', brand_id);
    formData.append('status', status);
    formData.append('description', description);
    
    const imageInput = document.getElementById('p-images');
    if (imageInput.files.length > 0) {
        for (let i = 0; i < imageInput.files.length; i++) {
            // Tên 'images' ở đây PHẢI KHỚP với tên trong upload.array ở Backend
            formData.append('images', imageInput.files[i]); 
        }
    }

    // Quyết định URL và Method dựa vào currentEditId
    const url = currentEditId 
        ? `${window.API_URL}/products/${currentEditId}` 
        : `${window.API_URL}/products/add`;
    
    const method = currentEditId ? 'PUT' : 'POST';

    try {
        btnSave.innerText = "Đang lưu...";
        btnSave.disabled = true;

        const response = await fetch(url, { method, body: formData });
        
        // Tránh lỗi khi server sập hoặc trả về HTML
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server trả về lỗi không xác định (404/500).");
        }

        const result = await response.json();

        if (result.success) {
            alert(currentEditId ? "Cập nhật thành công!" : "Thêm thành công!");
            if (typeof window.closeModal === 'function') window.closeModal();
            location.reload(); // Tải lại trang để thấy dữ liệu mới
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối tới Server!");
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = currentEditId ? "Cập nhật sản phẩm" : "Lưu sản phẩm";
    }
};

// Modal Toggle (Dùng chung)
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
async function loadProducts(filters = {}) {
    try {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return; // Thoát nếu không phải trang sản phẩm

        productGrid.innerHTML = '<div class="col-12 text-center"><p>Đang tải sản phẩm...</p></div>';

        // Lấy dữ liệu từ API
        const res = await fetch(`${window.API_URL}/products`);
        let products = await res.json();
        products = Array.isArray(products) ? products : (products.data || []);

        // --- BẮT ĐẦU QUY TRÌNH LỌC ---
        
        // 1. Lọc theo Tìm kiếm (Từ URL ?search=...)
        const urlParams = new URLSearchParams(window.location.search);
        const searchKeyword = urlParams.get('search')?.toLowerCase();
        if (searchKeyword) {
            products = products.filter(p => p.name.toLowerCase().includes(searchKeyword));
            // Cập nhật tiêu đề trang
            const titleEl = document.querySelector('.section-title');
            if (titleEl) titleEl.innerText = `Kết quả tìm kiếm cho: "${searchKeyword}"`;
        }

        // 2. Lọc theo Danh mục (categoryId)
        const catId = filters.categoryId || urlParams.get('category');
        if (catId && catId !== 'all') {
            products = products.filter(p => p.category_id == catId);
        }

        // 3. Lọc theo Thương hiệu (brandId)
        const bId = filters.brandId || urlParams.get('brand');
        if (bId && bId !== 'all') {
            products = products.filter(p => p.brand_id == bId);
        }

        // 4. Lọc theo Khoảng giá
        const priceRange = filters.priceRange || document.getElementById('filter-price')?.value;
        if (priceRange && priceRange !== 'all') {
            products = products.filter(p => {
                const price = Number(p.price);
                if (priceRange === '0-10') return price < 10000000;
                if (priceRange === '10-20') return price >= 10000000 && price <= 20000000;
                if (priceRange === '20-up') return price > 20000000;
                return true;
            });
        }

        // 5. Sắp xếp giá
        const sortType = filters.sortType || document.getElementById('sort-price')?.value;
        if (sortType === 'asc') products.sort((a, b) => Number(a.price) - Number(b.price));
        else if (sortType === 'desc') products.sort((a, b) => Number(b.price) - Number(a.price));

        // --- HIỂN THỊ ---
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <img src="../assets/img/no-product.png" style="width:100px; opacity:0.5" onerror="this.style.display='none'">
                    <p class="mt-3">Không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.</p>
                    <a href="products.html" class="btn btn-outline-danger btn-sm">Xem tất cả sản phẩm</a>
                </div>`;
        } else {
            renderProductGrid(products);
        }

        // Cập nhật số lượng
        const countEl = document.getElementById('product-count');
        if (countEl) countEl.innerText = `${products.length} sản phẩm`;

    } catch (error) {
        console.error("Lỗi load sản phẩm:", error);
        if (productGrid) productGrid.innerHTML = '<p class="text-danger">Không thể kết nối đến máy chủ.</p>';
    }
}

function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = products.map(p => {
        const imgPath = p.image ? p.image.split(',')[0] : 'default.jpg';
        const finalImgPath = `../assets/img/products/${imgPath}`;
        
        return `
            <div class="product-card" onclick="goToDetail(${p.id})">
                <div class="product-image">
                    <img src="${finalImgPath}" onerror="this.src='../assets/img/products/default.jpg'">
                </div>
                <div class="info">
                    <h3 class="product-name" title="${p.name}">${p.name}</h3>
                    <p class="product-price">${Number(p.price).toLocaleString('vi-VN')} ₫</p>
                    <div class="product-actions">
                        <button class="btn-cart-outline" onclick="event.stopPropagation(); addToCart(${p.id})">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="btn-buy-now" onclick="event.stopPropagation(); buyNow(${p.id})">Mua ngay</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Hàm chuyển trang chi tiết
function goToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}


function filterProducts() {
    // Lấy giá trị từ các ô Select trên giao diện
    const categoryId = document.getElementById('filter-category')?.value;
    const brandId = document.getElementById('filter-brand')?.value;
    const priceRange = document.getElementById('filter-price')?.value;
    const sortType = document.getElementById('sort-price')?.value;

    // Truyền tất cả vào loadProducts để xử lý
    loadProducts({ 
        categoryId: categoryId === 'all' ? null : categoryId, 
        brandId: brandId === 'all' ? null : brandId,
        priceRange,
        sortType
    });
}

function changeStore(element) {
    // 1. Lấy link bản đồ từ thuộc tính data-map của thẻ vừa click
    const mapUrl = element.getAttribute('data-map');
    
    // 2. Tìm thẻ iframe bản đồ và thay đổi src
    const mapIframe = document.getElementById('google-map');
    if (mapIframe) {
        mapIframe.src = mapUrl;
    }

    // 3. Xử lý giao diện (Xóa class active ở các thẻ khác, thêm vào thẻ hiện tại)
    const allCards = document.querySelectorAll('.store-card');
    allCards.forEach(card => card.classList.remove('active'));
    element.classList.add('active');

    // 4. Cuộn mượt lên đầu bản đồ (nếu trên mobile)
    if (window.innerWidth < 768) {
        mapIframe.scrollIntoView({ behavior: 'smooth' });
    }
}


function performSearch(keyword) {
    if (!keyword.trim()) return;
    // Chuyển hướng sang trang sản phẩm kèm tham số tìm kiếm
    window.location.href = `products.html?search=${encodeURIComponent(keyword.trim())}`;
}

function performSearch(keyword) {
    const cleanKeyword = keyword ? keyword.trim() : "";
    if (!cleanKeyword) return;
    
    // Chuyển hướng sang trang sản phẩm với tham số tìm kiếm
    window.location.href = `products.html?search=${encodeURIComponent(cleanKeyword)}`;
}

/**
 * Hàm đóng mở cửa sổ Chat
 */
// 2. Gán sự kiện an toàn (Kỹ thuật Event Delegation)
// Cách này đảm bảo JS luôn bắt được sự kiện dù header.html có load chậm đi nữa
(function() {
    // Bắt sự kiện nhấn phím trên toàn bộ tài liệu
    document.addEventListener('keydown', (e) => {
        // 1. Nếu nhấn Enter khi đang ở trong ô Tìm kiếm
        if (e.key === 'Enter' && e.target.matches('.search-box input')) {
            e.preventDefault(); // Chặn tải lại trang
            window.performSearch(e.target.value);
        }
        
        // 2. Nếu nhấn Enter khi đang ở trong ô Chatbot
        if (e.key === 'Enter' && e.target.id === 'chat-input') {
            e.preventDefault();
            window.handleChat();
        }
    });

    // Bắt sự kiện Click trên toàn bộ tài liệu
    document.addEventListener('click', (e) => {
        // Nếu click trúng cái <button> tìm kiếm (hoặc bấm vào icon bên trong nó)
        const searchBtn = e.target.closest('.search-box button');
        if (searchBtn) {
            // Tìm ô input nằm ngay cạnh cái nút đó để lấy từ khóa
            const input = searchBtn.parentElement.querySelector('input');
            if (input) window.performSearch(input.value);
        }
    });
})();

let allUsers = [];

// Hàm vẽ bảng riêng biệt để tái sử dụng khi tìm kiếm
async function loadUsers() {
    const userTable = document.getElementById('admin-user-list');
    if (!userTable) return; // Nếu không phải trang users.html thì thoát luôn

    try {
        const response = await fetch('http://localhost:3000/api/users');
        const result = await response.json();
        if (result.success) {
            allUsers = result.data;
            renderTable(allUsers);
        }
    } catch (error) {
        console.error("Lỗi tải người dùng:", error);
    }
}
// 1. Tải danh sách người dùng
async function fetchUsers() {
    const tbody = document.getElementById('admin-user-list');
    if (!tbody) return; // Bảo vệ nếu không phải trang users

    try {
        const response = await fetch('http://localhost:3000/api/users');
        const result = await response.json();
        if (result.success) {
            allUsers = result.data;
            renderTable(allUsers); // Gọi hàm vẽ bảng
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    }
}

// 2. Vẽ bảng (Sửa ID cho khớp với HTML)
function renderTable(users) {
    const tbody = document.getElementById('admin-user-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Không tìm thấy người dùng nào.</td></tr>';
        return;
    }

    users.forEach(user => {
        const roleClass = user.role === 'admin' ? 'role-admin' : (user.role === 'employee' ? 'role-employee' : 'role-user');
        const statusClass = user.status === 1 ? 'status-active' : 'status-locked';
        const statusText = user.status === 1 ? 'Hoạt động' : 'Đã khóa';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td><strong>${user.name}</strong><br><small style="color:#7f8c8d">@${user.name.replace(/\s+/g, '').toLowerCase()}</small></td>
            <td>${user.email}</td>
            <td><span class="badge ${roleClass}">${user.role.toUpperCase()}</span></td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td style="text-align: right;">
                <button onclick="openModal('edit', ${user.id})" class="action-btn btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="toggleStatus(${user.id}, ${user.status})" class="action-btn ${user.status === 1 ? 'btn-lock' : 'btn-unlock'}">
                    <i class="fas ${user.status === 1 ? 'fa-lock' : 'fa-unlock'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Lắng nghe tìm kiếm (Dùng ID user-search từ HTML)
document.getElementById('user-search')?.addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(keyword) || 
        user.email.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
});