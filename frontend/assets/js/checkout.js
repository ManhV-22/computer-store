/**
 * assets/js/checkout.js
 * Xử lý hiển thị tóm tắt đơn hàng và gửi dữ liệu thanh toán về MySQL qua Backend
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hiển thị danh sách sản phẩm cần thanh toán
    renderCheckoutSummary();
    
    // 2. Tự động điền thông tin khách hàng nếu đã đăng nhập
    fillUserInfo();
});

/**
 * Lấy thông tin user từ localStorage để điền vào form
 */
function fillUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const fullnameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        
        if (fullnameInput) fullnameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
        // phone thường không có trong object user cơ bản, người dùng sẽ tự nhập
    }
}

/**
 * Hiển thị tóm tắt đơn hàng ở sidebar
 */
function renderCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('checkout-items-list');
    
    // Nếu giỏ hàng trống, không cho ở lại trang thanh toán
    if (cart.length === 0) {
        window.showNotification("🛒 Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm.", "error");
        // Đợi 1.5s để người dùng đọc thông báo rồi mới đẩy về trang chủ
        setTimeout(() => {
            window.location.href = "http://127.0.0.1:5500/computer-store/frontend/pages/index.html"; 
        }, 1500);
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        container.innerHTML += `
            <div class="order-item" style="display: flex; gap: 15px; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px;">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border: 1px solid #ddd;">
                <div class="order-item-info" style="flex: 1;">
                    <div class="order-item-name" style="font-weight: bold; font-size: 0.9rem;">${item.name}</div>
                    <div class="order-item-qty" style="font-size: 0.8rem; color: #666;">Số lượng: ${item.quantity}</div>
                </div>
                <div class="order-item-price" style="font-weight: bold; color: #d70018;">
                    ${itemTotal.toLocaleString('vi-VN')}đ
                </div>
            </div>
        `;
    });

    // Cập nhật các ô hiển thị tổng tiền
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
    if (totalEl) totalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
}

/**
 * Hàm chính: Xử lý khi nhấn nút "XÁC NHẬN ĐẶT HÀNG"
 */
async function processCheckout() {
    const btnSubmit = document.querySelector('.btn-place-order');
    
    // Lấy dữ liệu từ Form
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const note = document.getElementById('note').value.trim();
    
    // Lấy phương thức thanh toán
    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'cod';

    // Kiểm tra validate cơ bản
    if (!fullname || !phone || !address) {
        window.showNotification("⚠️ Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ!", "error");
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));

    // Chuẩn bị object dữ liệu gửi lên API
    const orderData = {
        userId: user ? user.id : null,
        customer: { 
            fullname: fullname, 
            phone: phone, 
            address: address, 
            email: email, 
            note: note 
        },
        paymentMethod: paymentMethod,
        // Chuyển đổi item giỏ hàng khớp với cột trong bảng order_detail (product_id)
        items: cart.map(item => ({
            id: item.id, 
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
        // Vô hiệu hóa nút để tránh người dùng nhấn 2 lần (spam đơn hàng)
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "ĐANG XỬ LÝ...";
            btnSubmit.style.backgroundColor = "#95a5a6";
        }

        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            // Thông báo nổi thành công
            window.showNotification(`🎉 Đặt hàng thành công! Mã đơn: #${result.orderId}`, "success");
            
            localStorage.removeItem('cart');

            // Cập nhật lại số lượng giỏ hàng trên Header (gọi hàm từ main.js)
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }

            // Đợi 2 giây để khách đọc thông báo xong rồi mới đá về trang chủ
            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5500/computer-store/frontend/pages/index.html"; 
            }, 2000);

        } else {
            throw new Error(result.message || "Lỗi từ phía máy chủ khi lưu đơn hàng.");
        }

    } catch (error) {
        console.error("Lỗi quá trình thanh toán:", error);
        window.showNotification("❌ Có lỗi xảy ra: " + error.message, "error");
        
        // Kích hoạt lại nút nếu lỗi để khách hàng thử lại
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "XÁC NHẬN ĐẶT HÀNG";
            btnSubmit.style.backgroundColor = "#27ae60";
        }
    }
}