// assets/js/home.js

// 1. KHO DỮ LIỆU GIẢ (12 SẢN PHẨM)
const mockProducts = [
    // --- LAPTOP ---
    { id: 1, name: "Laptop Asus ROG Strix G15", price: 25990000, oldPrice: 28990000, image: "https://via.placeholder.com/200/333333/FFFFFF?text=Asus+ROG", sku: "ASUS-01", color: "Đen", category: "laptop", isFlashSale: true },
    { id: 2, name: "MacBook Air M1 2020", price: 18500000, oldPrice: 22000000, image: "https://via.placeholder.com/200/EEEEEE/333333?text=MacBook+Air", sku: "MAC-M1", color: "Bạc", category: "laptop", isFlashSale: true },
    { id: 3, name: "Laptop Acer Nitro 5 Tiger", price: 21500000, oldPrice: 23500000, image: "https://via.placeholder.com/200/e74c3c/FFFFFF?text=Acer+Nitro+5", sku: "ACER-01", color: "Đen Đỏ", category: "laptop", isFlashSale: false },
    { id: 4, name: "Laptop Lenovo Legion 5", price: 28900000, oldPrice: 31000000, image: "https://via.placeholder.com/200/555555/FFFFFF?text=Legion+5", sku: "LENOVO-01", color: "Xám", category: "laptop", isFlashSale: false },

    // --- PC LẮP RÁP ---
    { id: 5, name: "PC Gaming Core i5 12400F / RTX 3060", price: 15990000, oldPrice: 18000000, image: "https://via.placeholder.com/200/2ecc71/FFFFFF?text=PC+Gaming+i5", sku: "PC-I5-3060", color: "Case Đen LED RGB", category: "pc", isFlashSale: true },
    { id: 6, name: "PC Đồ Họa Core i7 13700K / RTX 4070", price: 35500000, oldPrice: 38000000, image: "https://via.placeholder.com/200/16a085/FFFFFF?text=PC+Creator+i7", sku: "PC-I7-4070", color: "Case Trắng", category: "pc", isFlashSale: false },
    { id: 7, name: "PC Văn Phòng Core i3 12100 / 8GB RAM", price: 5500000, oldPrice: 6500000, image: "https://via.placeholder.com/200/bdc3c7/333333?text=PC+Office", sku: "PC-OFFICE-01", color: "Case Đen Nhỏ", category: "pc", isFlashSale: false },
    { id: 8, name: "Màn hình LG 24 inch IPS 75Hz", price: 2500000, oldPrice: 3000000, image: "https://via.placeholder.com/200/34495e/FFFFFF?text=Màn+hình+LG", sku: "LG-24MP", color: "Đen", category: "pc", isFlashSale: true },

    // --- ĐIỆN THOẠI & APPLE ---
    { id: 9, name: "iPhone 15 Pro Max 256GB", price: 29990000, oldPrice: 34990000, image: "https://via.placeholder.com/200/8e44ad/FFFFFF?text=iPhone+15+ProMax", sku: "IP15-PM-256", color: "Titan Tự Nhiên", category: "phone", isFlashSale: false },
    { id: 10, name: "Samsung Galaxy S24 Ultra", price: 27500000, oldPrice: 31990000, image: "https://via.placeholder.com/200/2c3e50/FFFFFF?text=S24+Ultra", sku: "SS-S24U", color: "Đen Titan", category: "phone", isFlashSale: true },
    { id: 11, name: "iPad Pro M2 11 inch WiFi", price: 20500000, oldPrice: 23000000, image: "https://via.placeholder.com/200/95a5a6/333333?text=iPad+Pro+M2", sku: "IPAD-PROM2", color: "Xám Không Gian", category: "phone", isFlashSale: false },
    { id: 12, name: "Tai nghe AirPods Pro 2", price: 5800000, oldPrice: 6500000, image: "https://via.placeholder.com/200/ecf0f1/333333?text=AirPods+Pro+2", sku: "AIRPODS-PRO2", color: "Trắng", category: "phone", isFlashSale: false }
];

// 2. KHỞI CHẠY KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});

// 3. HÀM HIỂN THỊ SẢN PHẨM RA MÀN HÌNH
function renderProducts() {
    const flashSaleContainer = document.getElementById('flash-sale-list');
    const laptopContainer = document.getElementById('laptop-list');
    const pcContainer = document.getElementById('pc-list');
    const phoneContainer = document.getElementById('phone-list');

    let htmlData = { flashSale: '', laptop: '', pc: '', phone: '' };

    mockProducts.forEach(product => {
        // Khung HTML dùng chung cho mọi sản phẩm
        const productCard = `
            <div class="product-card" style="background: #fff; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; transition: 0.3s; display: flex; flex-direction: column; justify-content: space-between;">
                ${product.oldPrice ? `<span style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; z-index: 2;">-${Math.round((1 - product.price/product.oldPrice)*100)}%</span>` : ''}
                
                <a href="detail.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                        <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <h4 style="font-size: 1rem; color: #333; margin-bottom: 10px; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.name}</h4>
                    </div>
                </a>
                
                <div>
                    <div style="color: #e74c3c; font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${product.price.toLocaleString('vi-VN')}đ</div>
                    <div style="color: #95a5a6; text-decoration: line-through; font-size: 0.9rem; margin-bottom: 15px;">${product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') + 'đ' : '&nbsp;'}</div>
                </div>
                
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image}', '${product.sku}', '${product.color}')" 
                        style="width: 100%; padding: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    🛒 Thêm vào giỏ
                </button>
            </div>
        `;

        // Phân loại đổ dữ liệu vào các khu vực tương ứng
        if (product.isFlashSale) htmlData.flashSale += productCard;
        if (product.category === 'laptop') htmlData.laptop += productCard;
        if (product.category === 'pc') htmlData.pc += productCard;
        if (product.category === 'phone') htmlData.phone += productCard;
    });

    // In HTML ra trình duyệt
    if (flashSaleContainer) flashSaleContainer.innerHTML = htmlData.flashSale;
    if (laptopContainer) laptopContainer.innerHTML = htmlData.laptop;
    if (pcContainer) pcContainer.innerHTML = htmlData.pc;
    if (phoneContainer) phoneContainer.innerHTML = htmlData.phone;
}

// 4. HÀM THÊM VÀO GIỎ HÀNG (Lưu vào localStorage)
function addToCart(id, name, price, image, sku, color) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, sku, color, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm ${name} vào giỏ hàng!`);
    updateCartCount(); 
}

// 5. HÀM CẬP NHẬT SỐ LƯỢNG TRÊN HEADER
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.innerText = totalQty;
    });
}