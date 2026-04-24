// Lấy dữ liệu thực tế từ localStorage
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let discountAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Đợi một chút để Header kịp load xong rồi mới render giỏ hàng
    setTimeout(() => {
        renderCart();
    }, 100); 
});

function renderCart() {
    const wrapper = document.getElementById('cart-items-wrapper');
    const countLabel = document.getElementById('cart-item-count');
    const headerCartCount = document.getElementById('cart-count'); 
    
    if (!wrapper) return;

    if (cartItems.length === 0) {
        wrapper.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <h3 style="color: #7f8c8d;">Giỏ hàng của bạn đang trống</h3>
                <a href="../pages/index.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #d70018; color: white; text-decoration: none; border-radius: 4px;">Tiếp tục mua sắm</a>
            </div>`;
        updateSummary(0);
        if (countLabel) countLabel.innerText = "0";
        if (headerCartCount) headerCartCount.innerText = "0";
        return;
    }

    wrapper.innerHTML = '';
    let subtotal = 0;
    let totalQty = 0;

    cartItems.forEach((item, index) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        totalQty += (item.quantity || 1);

        // --- CHỖ SỬA QUAN TRỌNG: XỬ LÝ ẢNH ĐỂ KHÔNG BỊ LỖI 404 ---
        let displayImg = '../assets/img/products/default.jpg'; // Ảnh mặc định
        
        if (item.image) {
            // 1. Tách chuỗi ảnh và lấy tấm đầu tiên
            const firstImgName = item.image.split(',')[0].trim().replace(/[\[\]"']/g, "");
            
            // 2. Kiểm tra xem là link URL (http) hay file trong thư mục local
            if (firstImgName.startsWith('http')) {
                displayImg = firstImgName;
            } else if (firstImgName !== "") {
                displayImg = `../assets/img/products/${firstImgName}`;
            }
        }
        // --- HẾT PHẦN SỬA ---

        const oldPriceHtml = item.oldPrice ? `<div class="price-old">${Number(item.oldPrice).toLocaleString('vi-VN')}đ</div>` : '';

        wrapper.innerHTML += `
            <div class="cart-item">
                <div class="item-img-box">
                    <img src="${displayImg}" alt="${item.name}" 
                         onerror="this.src='../assets/img/products/default.jpg'">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-meta">
                        <span>Mã SP: ${item.sku || 'N/A'}</span>
                        <span>|</span>
                        <span>Màu: ${item.variant || 'Mặc định'}</span>
                    </div>
                    <div class="item-stock">✓ Còn hàng</div>
                </div>
                <div class="item-prices">
                    <div class="price-current">${Number(item.price).toLocaleString('vi-VN')}đ</div>
                    ${oldPriceHtml}
                </div>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                    <button class="btn-remove" onclick="removeItem(${index})">
                        🗑 Xóa
                    </button>
                </div>
            </div>
        `;
    });

    if (countLabel) countLabel.innerText = totalQty;
    if (headerCartCount) headerCartCount.innerText = totalQty;
    updateSummary(subtotal);
}
function updateQty(index, change) {
    if (cartItems[index].quantity + change >= 1) {
        cartItems[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    }
}

function removeItem(index) {
    if (confirm("Bạn có chắc chắn muốn bỏ sản phẩm này?")) {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    }
}

function updateSummary(subtotal) {
    const finalTotal = subtotal - discountAmount;
    
    const subtotalEl = document.getElementById('subtotal-price');
    const discountEl = document.getElementById('discount-price');
    const finalEl = document.getElementById('final-price');

    if (subtotalEl) subtotalEl.innerText = Number(subtotal).toLocaleString('vi-VN') + 'đ';
    if (discountEl) discountEl.innerText = discountAmount > 0 ? '-' + Number(discountAmount).toLocaleString('vi-VN') + 'đ' : '0đ';
    if (finalEl) finalEl.innerText = Number(finalTotal > 0 ? finalTotal : 0).toLocaleString('vi-VN') + 'đ';
}

function applyCoupon() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const messageBox = document.getElementById('coupon-message');
    
    if (!messageBox) return;

    if (code === 'GIAM50K') {
        discountAmount = 50000;
        messageBox.innerHTML = '<span style="color: #27ae60;">✓ Đã áp dụng giảm 50.000đ</span>';
    } else if (code === '') {
        messageBox.innerHTML = '<span style="color: #e74c3c;">Vui lòng nhập mã</span>';
    } else {
        discountAmount = 0;
        messageBox.innerHTML = '<span style="color: #e74c3c;">✗ Mã không hợp lệ</span>';
    }
    renderCart();
}