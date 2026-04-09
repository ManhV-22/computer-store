// assets/js/orders.js

document.addEventListener('DOMContentLoaded', () => {
    // Gọi hàm render khi trang đã tải xong
    renderUserOrders();
});

async function renderUserOrders() {
    const container = document.getElementById('orders-container');
    
    // 1. LẤY USER TỪ LOCALSTORAGE (Đây là bước bạn bị thiếu dẫn đến lỗi)
    const user = JSON.parse(localStorage.getItem('user'));

    // Kiểm tra nếu chưa đăng nhập thì không chạy tiếp
    if (!user || !user.id) {
        if (container) {
            container.innerHTML = `
                <div class="no-orders" style="text-align: center; padding: 50px;">
                    <p>Vui lòng đăng nhập để xem lịch sử mua hàng.</p>
                    <a href="login.html" style="color: #d70018; font-weight: bold;">Đăng nhập ngay</a>
                </div>`;
        }
        return;
    }

    try {
        // 2. GỌI API LẤY DANH SÁCH ĐƠN HÀNG
        const response = await fetch(`http://localhost:3000/api/orders/user/${user.id}`);
        
        if (!response.ok) throw new Error("Không thể kết nối đến máy chủ");
        
        const orders = await response.json();

        // Kiểm tra nếu không có đơn hàng
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="no-orders" style="text-align: center; padding: 50px;">
                    <p>Bạn chưa có đơn hàng nào.</p>
                    <a href="../index.html" style="color: #3498db;">Tiếp tục mua sắm</a>
                </div>`;
            return;
        }

        // 3. ĐỔ DỮ LIỆU RA GIAO DIỆN
        container.innerHTML = orders.map(order => `
            <div class="order-card" onclick="viewOrderDetail(${order.id})" style="cursor: pointer;">
                <div class="order-header">
                    <div>
                        <span class="order-id">Mã đơn: #ORD${order.id}</span>
                        <div class="order-date">📅 ${new Date(order.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                    <span class="order-status status-${order.status}">
                        ${order.status === 'pending' ? '⌛ ĐANG XỬ LÝ' : '✅ HOÀN THÀNH'}
                    </span>
                </div>
                <div class="order-body">
                    <div class="order-info">
                        <div style="color: #3498db; font-size: 13px;">🔍 Bấm để xem chi tiết sản phẩm</div>
                    </div>
                    <div class="order-total">
                        <span class="total-label">Thành tiền</span>
                        <span class="total-amount">${parseFloat(order.total_price).toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        if (container) {
            container.innerHTML = `<p style="text-align: center; color: red; padding: 20px;">Có lỗi xảy ra khi tải dữ liệu đơn hàng!</p>`;
        }
    }
}

// Hàm lấy chi tiết sản phẩm từ bảng order_detail
async function viewOrderDetail(orderId) {
    const modal = document.getElementById('order-detail-modal');
    const itemsContainer = document.getElementById('modal-order-items');
    const modalId = document.getElementById('modal-order-id');

    if (!modal || !itemsContainer) return;

    modalId.innerText = `#ORD${orderId}`;
    itemsContainer.innerHTML = `<div style="text-align: center; padding: 20px;">⌛ Đang tải chi tiết...</div>`;
    modal.style.display = "block";

    try {
        // Gọi API lấy chi tiết (JOIN với bảng sản phẩm để có tên và ảnh)
        const response = await fetch(`http://localhost:3000/api/orders/detail/${orderId}`);
        const items = await response.json();

        if (items.length === 0) {
            itemsContainer.innerHTML = "Đơn hàng này không có dữ liệu sản phẩm.";
            return;
        }

        itemsContainer.innerHTML = items.map(item => `
            <div class="order-item-detail" style="display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #eee;">
                <img src="${item.image || '../assets/images/default.jpg'}" style="width: 60px; height: 60px; object-fit: contain;">
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${item.name || 'Sản phẩm #' + item.product_id}</div>
                    <div style="font-size: 14px; color: #666;">Số lượng: ${item.quantity} x ${parseFloat(item.price).toLocaleString()}đ</div>
                </div>
                <div style="font-weight: bold; color: #e74c3c;">
                    ${(item.quantity * item.price).toLocaleString()}đ
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        itemsContainer.innerHTML = "Không thể tải chi tiết đơn hàng.";
    }
}

// Đóng modal khi bấm nút X hoặc nút Đóng
function closeModal() {
    const modal = document.getElementById('order-detail-modal');
    if (modal) modal.style.display = "none";
}

// Đóng khi bấm ra ngoài vùng modal
window.addEventListener('click', (event) => {
    const modal = document.getElementById('order-detail-modal');
    if (event.target == modal) closeModal();
});

// Gắn sự kiện cho nút X đóng modal (nếu có trong HTML)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
        closeModal();
    }
});