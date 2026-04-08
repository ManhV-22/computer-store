// Lấy dữ liệu thực tế từ localStorage (bỏ mảng mock data cũ đi)
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let discountAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const wrapper = document.getElementById('cart-items-wrapper');
    const countLabel = document.getElementById('cart-item-count');
    
    // ... (Giữ nguyên đoạn HTML in ra giỏ hàng trống và duyệt mảng in ra sản phẩm)
    // Để tiết kiệm không gian, đoạn in HTML trong hàm này giữ y hệt như code cũ của bạn
    
    if (cartItems.length === 0) {
        wrapper.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <h3 style="color: #7f8c8d;">Giỏ hàng của bạn đang trống</h3>
                <a href="index.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 4px;">Tiếp tục mua sắm</a>
            </div>`;
        updateSummary(0);
        countLabel.innerText = "0";
        document.querySelector('.cart-count').innerText = "0";
        return;
    }

    wrapper.innerHTML = '';
    let subtotal = 0;
    let totalQty = 0;

    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalQty += item.quantity;

        const oldPriceHtml = item.oldPrice ? `<div class="price-old">${Number(item.oldPrice).toLocaleString('vi-VN')}đ</div>` : '';

        wrapper.innerHTML += `
            <div class="cart-item">
                <div class="item-img-box">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-meta">
                        <span>Mã SP: ${item.sku}</span>
                        <span>|</span>
                        <span>Màu: ${item.color}</span>
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

    countLabel.innerText = totalQty;
    document.querySelector('.cart-count').innerText = totalQty;
    updateSummary(subtotal);
}

// CẬP NHẬT 2 HÀM NÀY ĐỂ ĐỒNG BỘ LOCALSTORAGE SAU MỖI THAO TÁC
function updateQty(index, change) {
    if (cartItems[index].quantity + change >= 1) {
        cartItems[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cartItems)); // Lưu lại
        renderCart();
    }
}

function removeItem(index) {
    if (confirm("Bạn có chắc chắn muốn bỏ sản phẩm này?")) {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems)); // Lưu lại
        renderCart();
    }
}

// ... (Giữ nguyên các hàm updateSummary và applyCoupon cũ)
function updateSummary(subtotal) {
    const finalTotal = subtotal - discountAmount;
    
    document.getElementById('subtotal-price').innerText = Number(subtotal).toLocaleString('vi-VN') + 'đ';
    document.getElementById('discount-price').innerText = discountAmount > 0 ? '-' + Number(discountAmount).toLocaleString('vi-VN') + 'đ' : '0đ';
    document.getElementById('final-price').innerText = Number(finalTotal > 0 ? finalTotal : 0).toLocaleString('vi-VN') + 'đ';
}

function applyCoupon() {
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const messageBox = document.getElementById('coupon-message');
    
    if (code === 'GIAM50K') {
        discountAmount = 50000;
        messageBox.innerHTML = '<span style="color: #27ae60;">✓ Đã áp dụng giảm 50.000đ</span>';
    } else if (code === '') {
        messageBox.innerHTML = '<span style="color: #e74c3c;">Vui lòng nhập mã</span>';
    } else {
        discountAmount = 0;
        messageBox.innerHTML = '<span style="color: #e74c3c;">✗ Mã không hợp lệ hoặc đã hết hạn</span>';
    }
    renderCart();
}