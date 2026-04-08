// checkout.js
// assets/js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();
});

// Hàm hiển thị sản phẩm từ localStorage ra Sidebar thanh toán
function renderCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('checkout-items-list');
    
    // Nếu không có sản phẩm mà cố tình vào trang này thì đuổi về trang chủ
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
        window.location.href = "index.html";
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        container.innerHTML += `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">Số lượng: ${item.quantity}</div>
                </div>
                <div class="order-item-price">${itemTotal.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    });

    // Cập nhật tổng tiền
    document.getElementById('checkout-subtotal').innerText = total.toLocaleString('vi-VN') + 'đ';
    document.getElementById('checkout-total').innerText = total.toLocaleString('vi-VN') + 'đ';
}

// Hàm Xử lý khi bấm nút Xác nhận đặt hàng
function processCheckout() {
    // 1. Lấy thông tin khách hàng nhập vào form
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    
    // Lấy phương thức thanh toán đang được chọn
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // 2. Kiểm tra validate form cơ bản
    if (!fullname || !phone || !address) {
        alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!");
        return;
    }

    // 3. Giả lập gọi API gửi đơn hàng lên Backend (Hiện tại chỉ log ra console)
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderData = {
        customer: { fullname, phone, address },
        paymentMethod: paymentMethod,
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toLocaleString()
    };
    
    console.log("Dữ liệu đơn hàng chuẩn bị gửi lên Server:", orderData);

    // 4. Báo thành công, dọn dẹp và chuyển hướng
    alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ComputerStore.\nChúng tôi sẽ sớm liên hệ để giao hàng.");
    
    // Xóa giỏ hàng sau khi mua xong
    localStorage.removeItem('cart');
    
    // Đẩy về trang chủ
    window.location.href = "index.html";
}