// 1. Khai báo biến toàn cục ở đầu file để lưu toàn bộ sản phẩm
let allProductsData = []; 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();

        if (response.ok && result.success) {
            // 2. Gán dữ liệu vào biến toàn cục
            allProductsData = result.data; 

            // ... (Phần code cũ của bạn: hàm renderToContainer và các hàm lọc theo category_id giữ nguyên) ...
            
            // Ví dụ (giữ nguyên của bạn):
            // const laptops = allProductsData.filter(p => p.category_id == 1);
            // renderToContainer(laptops, 'laptop-list');
        }
    } catch (error) {
        console.error("Lỗi home.js:", error);
    }
});

// ==========================================
// 3. THÊM HÀM MỚI Ở CUỐI FILE: Xử lý sự kiện click vào Thương hiệu
// ==========================================
function filterByBrand(brandId, brandName) {
    // Lọc ra các sản phẩm có brand_id khớp với hãng được click
    const filteredProducts = allProductsData.filter(p => p.brand_id == brandId);
    
    // Lấy các phần tử HTML cần thao tác
    const resultContainer = document.getElementById('brand-filter-result');
    const titleElement = document.getElementById('brand-result-title');
    const listElement = document.getElementById('filtered-brand-list');

    // Hiện khung kết quả và cập nhật tiêu đề
    resultContainer.style.display = 'block';
    titleElement.innerHTML = `🔥 Sản phẩm chính hãng: ${brandName}`;

    // Kiểm tra xem hãng này có sản phẩm nào không
    if (filteredProducts.length === 0) {
        listElement.innerHTML = `
            <div style="grid-column: span 4; text-align: center; padding: 20px; color: #7f8c8d;">
                <p>Hiện chưa có sản phẩm nào thuộc thương hiệu ${brandName} trong kho.</p>
            </div>`;
    } else {
        // Vẽ sản phẩm ra HTML
        listElement.innerHTML = filteredProducts.map(product => `
            <div class="product-item" style="border: 1px solid #eee; padding: 15px; border-radius: 8px; text-align: center; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: 150px; object-fit: contain; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; font-size: 1rem; color: #2c3e50;">${product.name}</h4>
                <p style="color: #e74c3c; font-weight: bold; margin-bottom: 15px; font-size: 1.1rem;">${Number(product.price).toLocaleString('vi-VN')} đ</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" style="background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; transition: 0.2s;">
                    🛒 Thêm vào giỏ hàng
                </button>
            </div>
        `).join('');
    }

    // Tự động cuộn màn hình xuống chỗ kết quả cho người dùng dễ nhìn
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Chạy hàm cập nhật số lượng khi load trang
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});