const API_BRANDS = 'http://localhost:3000/api/brands';

// 1. TẢI DANH SÁCH THƯƠNG HIỆU
async function loadBrands() {
    try {
        const response = await fetch(API_BRANDS);
        const brands = await response.json();
        const tbody = document.getElementById('brandTableBody');
        tbody.innerHTML = '';

        if (brands.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Chưa có thương hiệu nào</td></tr>`;
            return;
        }

        brands.forEach(brand => {
            // Sửa logic đường dẫn: DB lưu assets/... nên Admin lùi 1 cấp dùng ../assets/...
            const imagePath = (brand.image && brand.image !== 'undefined') 
                ? `../${brand.image.replace(/^\//, '')}` // Đảm bảo không có dấu / thừa ở đầu
                : '../assets/img/no-logo.png';

            const statusBadge = brand.status == 1 
                ? '<span style="background:#2ecc71; color:white; padding:4px 8px; border-radius:12px; font-size:12px;">Hoạt động</span>' 
                : '<span style="background:#e74c3c; color:white; padding:4px 8px; border-radius:12px; font-size:12px;">Đang ẩn</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 12px;">#${brand.id}</td>
                <td style="padding: 12px;">
                    <img src="${imagePath}" onerror="this.src='../assets/img/no-logo.png'" style="width: 50px; height: 50px; object-fit: contain; border-radius: 5px; border: 1px solid #eee;">
                </td>
                <td style="padding: 12px; font-weight: bold;">${brand.name}</td>
                <td style="padding: 12px;">${statusBadge}</td>
                <td style="padding: 12px;">
                    <button onclick="editBrand(${brand.id})" style="background: #f39c12; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Sửa</button>
                    <button onclick="deleteBrand(${brand.id})" style="background: #e74c3c; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Lỗi tải brand:", error);
    }
}

// 2. HIỂN THỊ ẢNH XEM TRƯỚC
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logoPreview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// 3. MỞ/ĐÓNG MODAL
function openBrandModal() {
    document.getElementById('brandForm').reset();
    document.getElementById('brandId').value = '';
    document.getElementById('brandImage').required = true;
    document.getElementById('logoPreview').src = '../assets/img/no-logo.png';
    document.getElementById('modalTitle').innerText = 'Thêm Thương Hiệu Mới';
    document.getElementById('brandModal').style.display = 'flex';
}

function closeBrandModal() {
    document.getElementById('brandModal').style.display = 'none';
}

// 4. LƯU (THÊM / SỬA)
async function saveBrand(event) {
    event.preventDefault();
    const id = document.getElementById('brandId').value;
    const name = document.getElementById('brandName').value.trim();
    const status = document.getElementById('brandStatus').value;
    const imageFile = document.getElementById('brandImage').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('status', status);
    if (imageFile) formData.append('image', imageFile);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BRANDS}/${id}` : API_BRANDS;

    try {
        const response = await fetch(url, { method: method, body: formData });
        if (response.ok) {
            showToast(id ? "Cập nhật thành công!" : "Thêm mới thành công!");
            closeBrandModal();
            loadBrands();
        } else {
            showToast("Lỗi từ server!", false);
        }
    } catch (error) {
        showToast("Lỗi kết nối!", false);
    }
}

// 5. LẤY DỮ LIỆU ĐỂ SỬA
async function editBrand(id) {
    try {
        const response = await fetch(`${API_BRANDS}/${id}`);
        const brand = await response.json();
        
        document.getElementById('brandId').value = brand.id;
        document.getElementById('brandName').value = brand.name;
        document.getElementById('brandStatus').value = brand.status || 1;
        
        // Sửa hiển thị ảnh trong modal edit
        const imagePath = (brand.image && brand.image !== 'undefined') ? `../${brand.image}` : '../assets/img/no-logo.png';
        document.getElementById('logoPreview').src = imagePath;
        
        document.getElementById('brandImage').required = false;
        document.getElementById('modalTitle').innerText = 'Cập nhật Thương Hiệu';
        document.getElementById('brandModal').style.display = 'flex';
    } catch (error) {
        showToast("Lỗi tải thông tin!", false);
    }
}

// 6. XỬ LÝ XÓA
async function cleanAndDeleteBrand(id) {
    if (!confirm("CẢNH BÁO: Thao tác này sẽ xóa TẤT CẢ sản phẩm thuộc thương hiệu này. Bạn chắc chắn chứ?")) return;

    try {
        // Xóa sản phẩm trước
        const resProd = await fetch(`${API_BRANDS}/${id}/products`, { method: 'DELETE' });
        const dataProd = await resProd.json();

        if (dataProd.success) {
            // Sau khi sạch sản phẩm, xóa thương hiệu
            const response = await fetch(`${API_BRANDS}/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                showToast("Đã xóa thương hiệu và toàn bộ sản phẩm!");
                loadBrands();
            }
        } else {
            showToast(dataProd.message, false);
        }
    } catch (error) {
        showToast("Lỗi kết nối!", false);
    }
}

async function deleteBrand(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;

    try {
        const response = await fetch(`${API_BRANDS}/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            showToast(data.message);
            loadBrands(); 
        } else {
            // Nếu lỗi do vướng khóa ngoại
            if (confirm(data.message + "\n\nBạn có muốn XÓA TẤT CẢ sản phẩm của thương hiệu này để xóa luôn thương hiệu không?")) {
                cleanAndDeleteBrand(id);
            }
        }
    } catch (error) {
        showToast("Lỗi kết nối server!", false);
    }
}

// TOAST NOTIFICATION
function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', top: '20px', right: '20px', padding: '12px 24px',
        borderRadius: '8px', color: 'white', fontWeight: 'bold', zIndex: '9999',
        backgroundColor: isSuccess ? '#2ecc71' : '#e74c3c',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'opacity 0.5s ease'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

window.onload = loadBrands;