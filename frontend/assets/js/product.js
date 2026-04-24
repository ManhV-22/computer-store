// product.js


document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-list');

    if (productContainer) {
        try {
            // Gọi API lấy danh sách sản phẩm từ máy chủ
            const response = await fetch(`${API_URL}/products`);
            const result = await response.json();

            if (response.ok && result.success) {
                const products = result.data;
                
                if (products.length === 0) {
                    productContainer.innerHTML = '<p>Hiện chưa có sản phẩm nào trong kho.</p>';
                    return;
                }

                // Dùng .map() để tạo mảng các chuỗi HTML, sau đó .join('') để nối chúng lại
                const htmlTemplate = products.map(product => `
                    <div class="product-card" style="border: 1px solid #e0e0e0; border-radius: 8px; width: 220px; padding: 15px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                        <a href="detail.html?id=${product.id}">
                            <img src="${product.image || 'https://via.placeholder.com/200'}" alt="${product.name}" style="width: 100%; height: 180px; object-fit: contain; margin-bottom: 15px;">
                        </a>
                        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px; height: 40px; overflow: hidden;">
                            <a href="detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">${product.name}</a>
                        </h3>
                        <p style="color: #d70018; font-weight: bold; font-size: 18px; margin-bottom: 15px;">
                            ${Number(product.price).toLocaleString('vi-VN')} đ
                        </p>
                        <button class="btn-add-cart" onclick="addToCart(${product.id})" style="background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; transition: 0.2s;">
                            🛒 Thêm vào giỏ hàng
                        </button>
                    </div>
                `).join('');

                // Đổ toàn bộ HTML vừa tạo vào container
                productContainer.innerHTML = htmlTemplate;

            } else {
                productContainer.innerHTML = '<p>Không thể tải dữ liệu sản phẩm.</p>';
            }
        } catch (error) {
            console.error("Lỗi:", error);
            productContainer.innerHTML = '<p>Lỗi kết nối đến máy chủ!</p>';
        }
    }
});
