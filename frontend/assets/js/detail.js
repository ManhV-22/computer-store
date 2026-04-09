document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const container = document.getElementById('product-detail-container');
    const longDescContainer = document.getElementById('product-long-description');
    const breadcrumb = document.getElementById('breadcrumb-name');

    if (!productId) {
        container.innerHTML = '<h3 style="text-align: center; color: #e74c3c;">Không tìm thấy mã sản phẩm!</h3>';
        return;
    }

    try {
        // 2. Gọi API lấy chi tiết MỘT sản phẩm
        // const response = await fetch(`${API_URL}/products/${productId}`);
        // Tạm thời vẫn lấy hết rồi lọc để demo nếu API chưa sẵn sàng
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();

        if (response.ok && result.success) {
            // const product = result.data; // Dùng khi API hỗ trợ lấy một SP
            const product = result.data.find(p => p.id == productId); // Tạm thời vẫn lọc

            if (!product) {
                container.innerHTML = '<h3 style="text-align: center;">Sản phẩm không tồn tại hoặc đã bị xóa.</h3>';
                return;
            }

            // 3. Đổ dữ liệu ra màn hình
            breadcrumb.innerText = product.name;
            longDescContainer.innerHTML = product.long_description || product.description || 'Mô tả chi tiết đang được cập nhật.';

            // Giả lập Giá cũ cao hơn giá bán 12%
            const oldPrice = Number(product.price) * 1.12; 

            // Cấu trúc HTML Chi tiết Sản phẩm Mới (Tương tự nhưng không y hệt mẫu)
            container.innerHTML = `
                <div class="product-detail-wrapper">
                    <div class="product-images">
                        <div class="main-img-container">
                            <img class="main-img" src="${product.image || 'https://via.placeholder.com/400'}" alt="${product.name}">
                        </div>
                        <div class="thumbnails">
                            <img src="${product.image || 'https://via.placeholder.com/400'}" alt="Thumb 1">
                            <img src="https://via.placeholder.com/400?text=Thumb+2" alt="Thumb 2">
                            <img src="https://via.placeholder.com/400?text=Thumb+3" alt="Thumb 3">
                        </div>
                    </div>

                    <div class="product-info">
                        <h1>${product.name}</h1>
                        <div class="product-meta">
                            <div class="product-meta-item">Mã SP: <strong>SP${product.id}</strong></div>
                            <div class="product-meta-item">Thương hiệu: <strong>${product.brand_name || product.brand || 'ComputerStore'}</strong></div>
                            <div class="product-meta-item">Tình trạng: <span class="status">✓ Còn hàng</span></div>
                        </div>
                        
                        <div class="price-section">
                            <span class="product-price">${Number(product.price).toLocaleString('vi-VN')} đ</span>
                            <span class="old-price">${oldPrice.toLocaleString('vi-VN')} đ</span>
                            
                            <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                                <div class="promo-section-title">Khuyến mãi & Ưu đãi</div>
                                <ul class="promo-list">
                                    <li>Giảm ngay 50.000đ khi thanh toán qua VNPay.</li>
                                    <li>Tặng chuột không dây Logitech B100.</li>
                                    <li>Mua kèm bàn phím cơ giảm ngay 10%.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="purchase-actions">
                            <div class="qty-selector">
                                <button onclick="let q = document.getElementById('qty'); if(q.value > 1) q.value--">-</button>
                                <input type="text" id="qty" value="1" readonly>
                                <button onclick="let q = document.getElementById('qty'); q.value++">+</button>
                            </div>
                            <button class="btn-add-cart-large" onclick="addToCartMulti(${product.id}, '${product.name}')">
                                🛒 THÊM VÀO GIỎ HÀNG
                            </button>
                        </div>

                        <div class="gifts-section">
                            <div class="gifts-section-title">Quà tặng đi kèm</div>
                            <ul class="gifts-list">
                                <li><span class="icon">🎁</span> Tặng Balo ComputerStore chính hãng.</li>
                                <li><span class="icon">🎧</span> Tặng Tai nghe Gaming Edifier.</li>
                            </ul>
                        </div>

                        <div class="commitments-section">
                            <div class="commitment-item">
                                <span class="icon">🛡️</span>
                                <span>Bảo hành chính hãng 12-24 tháng.</span>
                            </div>
                            <div class="commitment-item">
                                <span class="icon">🔄</span>
                                <span>Đổi trả miễn phí trong 7 ngày đầu.</span>
                            </div>
                            <div class="commitment-item">
                                <span class="icon">🚀</span>
                                <span>Giao hàng hỏa tốc trong 2h tại TP.HCM.</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        container.innerHTML = '<h3 style="text-align: center; color: #e74c3c;">Lỗi kết nối máy chủ.</h3>';
    }
});

// ==========================================
// CÁC HÀM XỬ LÝ CHỨC NĂNG MUA HÀNG
// ==========================================

function addToCartMulti(productId, productName) {
    // 1. KIỂM TRA ĐĂNG NHẬP
    const user = localStorage.getItem('user');
    if (!user) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng! 🔒");
        window.location.href = 'login.html';
        return; 
    }

    const qtyInput = document.getElementById('qty');
    const quantityToAdd = parseInt(qtyInput.value) || 1;

    // 2. LẤY GIỎ HÀNG TỪ LOCALSTORAGE
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        // Cập nhật số lượng
        existingItem.quantity += quantityToAdd; 
    } else {
        // Thêm mới
        // Lấy thông tin sản phẩm từ biến product trong DOMContentLoaded (không tiện)
        // Nên tạm thời chỉ dùng addToCart() của main.js hoặc viết lại.
        // Cách tốt nhất là addToCart() trong main.js chấp nhận tham số số lượng.
        // Tạm thời gọi addToCart nhiều lần.
        for (let i = 0; i < quantityToAdd; i++) {
            addToCart(productId); // addToCart có alert, sẽ bị nhiều lần. Cần sửa main.js.
        }
        alert(`Đã thêm ${quantityToAdd} sản phẩm "${productName}" vào giỏ hàng! 🛒`);
        updateCartCount();
        return; // Dừng vì addToCart đã handle
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 3. CẬP NHẬT GIAO DIỆN
    updateCartCount();
    alert(`Đã thêm ${quantityToAdd} sản phẩm "${productName}" vào giỏ hàng! 🛒`);
}

function buyNow(productId, productName) {
    addToCartMulti(productId, productName);
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}