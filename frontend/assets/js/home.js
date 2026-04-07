document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const productList = document.getElementById('product-list');

        productList.innerHTML = ''; // Xóa chữ "Đang tải..."

        if (products.length === 0) {
            productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #333;">Chưa có sản phẩm nào.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Fallback ảnh nếu database chưa có ảnh
            const imageSrc = product.image_url ? product.image_url : 'https://via.placeholder.com/300x200?text=ComputerStore';
            
            // Format giá tiền
            const priceString = Number(product.price).toLocaleString('vi-VN');

            // Cập nhật lại HTML của card để giống ảnh mẫu
            card.innerHTML = `
                <div class="discount-badge">Giảm sốc</div>
                <img src="${imageSrc}" alt="${product.name}" class="product-image">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${priceString}đ</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
            `;
            productList.appendChild(card);
        });
    } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        document.getElementById('product-list').innerHTML = '<p style="color: red; text-align: center; width: 100%;">Lỗi kết nối đến máy chủ!</p>';
    }
}

function addToCart(id) {
    alert('Chức năng giỏ hàng đang được phát triển. ID Sản phẩm: ' + id);
}