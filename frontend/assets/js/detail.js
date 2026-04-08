// assets/js/detail.js

// Tạm thời hardcode lại mảng data giống trang chủ để trang chi tiết có thể tìm kiếm được
const mockProducts = [
    { id: 1, name: "Laptop Asus ROG Strix G15", price: 25990000, oldPrice: 28990000, image: "https://via.placeholder.com/600/333333/FFFFFF?text=Asus+ROG", sku: "ASUS-01", color: "Đen" },
    { id: 2, name: "MacBook Air M1 2020", price: 18500000, oldPrice: 22000000, image: "https://via.placeholder.com/600/EEEEEE/333333?text=MacBook+Air", sku: "MAC-M1", color: "Bạc" },
    // Thêm các ID khác nếu bạn muốn test nhiều sản phẩm
];

let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
});

function loadProductDetail() {
    // Lấy ID từ URL (VD: detail.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    // Tìm sản phẩm trong kho
    currentProduct = mockProducts.find(p => p.id === productId) || mockProducts[0]; // Mặc định lấy cái số 1 nếu ko tìm thấy

    // Đổ dữ liệu ra HTML
    document.getElementById('bread-name').innerText = currentProduct.name;
    document.getElementById('detail-name').innerText = currentProduct.name;
    document.getElementById('detail-sku').innerText = currentProduct.sku;
    document.getElementById('main-image').src = currentProduct.image;
    
    document.getElementById('detail-price').innerText = currentProduct.price.toLocaleString('vi-VN') + 'đ';
    if(currentProduct.oldPrice) {
        document.getElementById('detail-old-price').innerText = currentProduct.oldPrice.toLocaleString('vi-VN') + 'đ';
    }
}

// Đổi ảnh thumbnail (Hiệu ứng UI)
function changeImage(element) {
    document.getElementById('main-image').src = element.src.replace('200', '600'); // Giả lập load ảnh to
    document.querySelectorAll('.thumbnail-list img').forEach(img => img.classList.remove('active'));
    element.classList.add('active');
}

// Thêm vào giỏ hàng
function addCurrentToCart() {
    if(!currentProduct) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...currentProduct, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm ${currentProduct.name} vào giỏ hàng!`);
}

// Mua ngay (Thêm vào giỏ và nhảy sang trang thanh toán)
function buyNow() {
    addCurrentToCart();
    window.location.href = "checkout.html";
}