document.addEventListener('DOMContentLoaded', () => {
    // Tự động load danh sách dropdown khi trang sẵn sàng
    if (document.getElementById('p-category')) {
        loadDropdownData();
    }

    // Tự động load danh sách sản phẩm khi vào trang quản lý
    if (document.getElementById('admin-product-list')) {
        loadAdminProducts();
    }

    // Xử lý sự kiện gửi form thêm sản phẩm
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('name', document.getElementById('p-name').value);
            formData.append('price', document.getElementById('p-price').value);
            formData.append('quantity', document.getElementById('p-quantity').value);
            formData.append('description', document.getElementById('p-description').value);
            formData.append('status', document.getElementById('p-status').value);
            formData.append('category_id', document.getElementById('p-category').value);
            formData.append('brand_id', document.getElementById('p-brand').value);
            
            const imageInput = document.getElementById('p-images');
            if (imageInput.files.length > 0) {
                for (let i = 0; i < imageInput.files.length; i++) {
                    formData.append('images', imageInput.files[i]);
                }
            }

            try {
                const res = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    body: formData
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    alert("Thêm sản phẩm thành công!");
                    closeModal();
                    loadAdminProducts(); 
                } else {
                    alert("Lỗi: " + result.message);
                }
            } catch (err) {
                console.error("Lỗi kết nối:", err);
                alert("Không thể kết nối đến server!");
            }
        });
    }
});

// Hàm lấy và hiển thị danh sách sản phẩm
async function loadAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    try {
        const res = await fetch('http://localhost:3000/api/products');
        const products = await res.json();
        
        list.innerHTML = products.map(item => {
            // Tách chuỗi ảnh trong DB
            const allImages = item.image ? item.image.split(',') : [];
            const safeImageString = (item.image || '').replace(/'/g, "\\'"); // Escape dấu nháy đơn trong tên file
            
            // --- LOGIC XỬ LÝ HIỂN THỊ ẢNH MỚI ---
            let imageHtml = '';
            
            if (allImages.length === 0) {
                // Trường hợp không có ảnh
                imageHtml = `<img src="../assets/img/default.jpg" class="admin-img-thumb" onerror="this.src='../assets/img/default.jpg'">`;
            } else if (allImages.length === 1) {
                // Trường hợp chỉ có 1 ảnh
                imageHtml = `<img src="../assets/img/${allImages[0]}" class="admin-img-thumb" onerror="this.src='../assets/img/default.jpg'">`;
            } else {
                // Trường hợp nhiều ảnh: Tạo hiệu ứng chồng ảnh
                // Chúng ta chỉ hiển thị tối đa 2 tấm ảnh đầu tiên làm thumb
                const numToShow = Math.min(2, allImages.length);
                const shownImages = allImages.slice(0, numToShow);
                
                imageHtml += '<div class="img-group">';
                shownImages.forEach((img, index) => {
                    // onerror=null để tránh vòng lặp load lỗi
                    imageHtml += `<img src="../assets/img/${img}" class="admin-img-thumb" onerror="this.onerror=null;this.src='../assets/img/default.jpg'">`;
                });
                
                // Hiển thị +X nếu còn ảnh khác
                if (allImages.length > numToShow) {
                    const remaining = allImages.length - numToShow;
                    imageHtml += `<div class="img-more-overlay">+${remaining}</div>`;
                }
                imageHtml += '</div>';
            }

            // --- END LOGIC ẢNH ---

            // Badge cho trạng thái
            const statusBadge = (item.status == 1 || item.status === '1')
                ? '<span style="color: green; background: #e8f5e9; padding: 2px 8px; border-radius: 4px;">Đang bán</span>' 
                : '<span style="color: red; background: #ffebee; padding: 2px 8px; border-radius: 4px;">Tạm ngưng</span>';

            return `
                <tr>
                    <td>${item.id}</td>
                    <td class="text-center">
                        <div class="img-viewer-trigger" onclick="viewAllImages('${safeImageString}')">
                            ${imageHtml}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 11px; color: #7f8c8d;">
                            ${item.brand_name || 'N/A'} | ${item.category_name || 'N/A'}
                        </div>
                    </td>
                    <td style="color: #e74c3c; font-weight: bold;">${Number(item.price).toLocaleString('vi-VN')}đ</td>
                    <td>${item.quantity}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="editProduct(${item.id})" class="btn-edit" style="cursor:pointer; padding: 5px 10px;">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button onclick="deleteProduct(${item.id})" class="btn-delete" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { 
        console.error("Lỗi tải danh sách sản phẩm:", err); 
    }
}

// Hàm load dữ liệu dropdown
async function loadDropdownData() {
    try {
        const [resCat, resBrand] = await Promise.all([
            fetch('http://localhost:3000/api/categories'),
            fetch('http://localhost:3000/api/brands')
        ]);

        const categories = await resCat.json();
        const brands = await resBrand.json();

        const catSelect = document.getElementById('p-category');
        if (catSelect) {
            catSelect.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }

        const brandSelect = document.getElementById('p-brand');
        if (brandSelect) {
            brandSelect.innerHTML = '<option value="">-- Chọn thương hiệu --</option>' + 
                brands.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }
    } catch (err) {
        console.error("Lỗi khi tải danh sách chọn:", err);
    }
}

// Hàm xóa sản phẩm
async function deleteProduct(id) {
    if (confirm("Xác nhận xóa sản phẩm này?")) {
        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                loadAdminProducts();
            } else {
                alert("Không thể xóa sản phẩm này!");
            }
        } catch (err) {
            console.error("Lỗi:", err);
        }
    }
}

// --- ĐÃ BỔ SUNG: LOGIC XEM HÌNH ẢNH ---
function viewAllImages(imageString) {
    if (!imageString) return;
    const allImages = imageString.split(',');
    
    const container = document.getElementById('imageViewerContainer');
    const modal = document.getElementById('imageViewerModal');
    
    if (!container || !modal) return;
    
    // Đổ danh sách ảnh vào grid
    container.innerHTML = allImages.map(img => `
        <img src="../assets/img/${img}" 
             alt="Product image" 
             class="viewer-img-item"
             onerror="this.src='../assets/img/default.jpg'">
    `).join('');
    
    // Mở modal
    modal.style.display = 'flex';
}

function closeViewerModal() {
    document.getElementById('imageViewerModal').style.display = 'none';
}

// --- END LOGIC ẢNH ---

// Điều khiển Modal thêm sản phẩm
function openAddModal() { 
    document.getElementById('productModal').style.display = 'flex'; 
}

function closeModal() { 
    document.getElementById('productModal').style.display = 'none'; 
    document.getElementById('add-product-form').reset();
}

function editProduct(id) { 
    alert("Chức năng cập nhật cho ID " + id + " đang được xử lý."); 
}

async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    try {
        const response = await fetch('sidebar.html');
        const html = await response.text();
        sidebarContainer.innerHTML = html;

        const currentPath = window.location.pathname;
        
        // Xóa tất cả class active trước
        const navLinks = document.querySelectorAll('.admin-sidebar a');
        navLinks.forEach(link => link.classList.remove('active'));

        // Kiểm tra đường dẫn và gán active
        if (currentPath.includes('dashboard.html')) {
            document.getElementById('nav-dashboard')?.classList.add('active');
        } else if (currentPath.includes('system.html')) { // Trang Tổng quan hệ thống
            document.getElementById('nav-system')?.classList.add('active');
        } else if (currentPath.includes('products.html')) {
            document.getElementById('nav-products')?.classList.add('active');
        } else if (currentPath.includes('categories.html')) {
            document.getElementById('nav-categories')?.classList.add('active');
        } else if (currentPath.includes('orders.html')) {
            document.getElementById('nav-orders')?.classList.add('active');
        } else if (currentPath.includes('users.html')) {
            document.getElementById('nav-users')?.classList.add('active');
        } else if (currentPath.includes('reports.html')) { // Trang Báo cáo thống kê
            document.getElementById('nav-reports')?.classList.add('active');
        }
    } catch (error) {
        console.error("Lỗi khi tải Sidebar:", error);
    }
}

// Đảm bảo loadSidebar được gọi khi trang vừa mở lên
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar(); // Thêm dòng này vào DOMContentLoaded hiện tại của bạn
    
    // Các code gọi dữ liệu cũ của bạn...
    if (document.getElementById('admin-product-list')) loadAdminProducts();
    if (document.getElementById('p-category')) loadDropdownData();
});


function handleLogout() {
    // Nếu bạn có dùng localStorage để lưu thông tin user, hãy xóa nó ở đây
    // localStorage.clear(); 
    
    alert("Đã đăng xuất thành công!");
    
    // Điều hướng chính xác ra thư mục pages
    window.location.href = "../pages/login.html"; 
}