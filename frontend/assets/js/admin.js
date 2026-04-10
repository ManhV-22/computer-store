document.addEventListener('DOMContentLoaded', () => {
    // Tự động load danh sách khi vào trang quản lý
    if (document.getElementById('admin-product-list')) {
        loadAdminProducts();
    }

    // Xử lý sự kiện gửi form thêm sản phẩm
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            // Lấy đầy đủ các trường khớp với DB
            formData.append('name', document.getElementById('p-name').value);
            formData.append('price', document.getElementById('p-price').value);
            formData.append('quantity', document.getElementById('p-quantity').value);
            formData.append('description', document.getElementById('p-description').value);
            formData.append('brand_id', document.getElementById('p-brand').value);
            formData.append('category_id', document.getElementById('p-category').value);
            formData.append('status', document.getElementById('p-status').value);
            
            // Xử lý nhiều file ảnh
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
            const allImages = item.image ? item.image.split(',') : [];
            const displayImage = allImages.length > 0 ? `../assets/img/${allImages[0]}` : '../assets/img/default.jpg';

            return `
                <tr>
                    <td>${item.id}</td>
                    <td>
                        <img src="${displayImage}" width="60" height="60" style="object-fit:cover; border-radius:6px;" onerror="this.src='../assets/img/default.jpg'">
                    </td>
                    <td>
                        <strong>${item.name}</strong><br>
                        <small>Thương hiệu: ${item.brand_name || 'N/A'} | Danh mục: ${item.category_name || 'N/A'}</small>
                    </td>
                    <td style="color:#c0392b; font-weight:bold;">${Number(item.price).toLocaleString()}đ</td>
                    <td>${item.quantity}</td> <td>
                        <span class="status-${item.status}">${item.status === 'active' ? 'Đang bán' : 'Tạm khóa'}</span>
                    </td>
                    <td>
                        <button onclick="editProduct(${item.id})" class="btn-edit">Sửa</button>
                        <button onclick="deleteProduct(${item.id})" class="btn-delete">Xóa</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { 
        console.error("Lỗi tải danh sách sản phẩm:", err); 
    }
}

// Hàm xóa sản phẩm
async function deleteProduct(id) {
    if (confirm("Xác nhận xóa sản phẩm này? Thao tác này không thể hoàn tác.")) {
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



// Điều khiển Modal
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

async function loadCategoriesAndBrands() {
    try {
        const [resCat, resBrand] = await Promise.all([
            fetch('http://localhost:3000/api/categories'),
            fetch('http://localhost:3000/api/brands')
        ]);
        
        const cats = await resCat.json();
        const brands = await resBrand.json();

        document.getElementById('p-category').innerHTML += cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('p-brand').innerHTML += brands.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    } catch (err) { console.error("Không load được danh sách chọn"); }
}

// Gọi hàm này trong DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadCategoriesAndBrands();
    // ... các code cũ
});

