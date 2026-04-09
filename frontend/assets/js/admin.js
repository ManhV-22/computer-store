// assets/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Bảo vệ trang
    // assets/js/admin.js

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
        alert("Bạn không có quyền truy cập!");
        // Đẩy về trang login đúng địa chỉ
        window.location.href = '/frontend/pages/login.html'; 
        return;
    }

    // Ẩn menu Admin-only nếu là nhân viên
    if (user.role === 'employee') {
        document.querySelectorAll('.admin-only').forEach(el => el.remove());
    }

    // Nếu đang ở trang orders thì load đơn hàng
    if (document.getElementById('admin-orders-list')) {
        fetchAllOrders();
    }

    // Thêm vào trong document.addEventListener('DOMContentLoaded', ...)
    if (document.getElementById('dashboard-overview')) {
        loadDashboardStats();
    }

    async function loadDashboardStats() {
        try {
            const res = await fetch('http://localhost:3000/api/admin/orders');
            const orders = await res.json();
            
            const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            document.getElementById('dashboard-overview').innerHTML = `
                <h2>Tổng quan hệ thống</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #e74c3c;">
                        <p style="color: #7f8c8d; margin: 0;">Tổng đơn hàng</p>
                        <h3 style="margin: 10px 0; font-size: 24px;">${orders.length}</h3>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #f1c40f;">
                        <p style="color: #7f8c8d; margin: 0;">Đơn chờ xử lý</p>
                        <h3 style="margin: 10px 0; font-size: 24px;">${pendingOrders}</h3>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #2ecc71;">
                        <p style="color: #7f8c8d; margin: 0;">Doanh thu dự kiến</p>
                        <h3 style="margin: 10px 0; font-size: 24px;">${totalRevenue.toLocaleString()}đ</h3>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error("Lỗi tải thống kê:", err);
        }
    }
});

async function fetchAllOrders() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/orders');
        const orders = await res.json();
        const list = document.getElementById('admin-orders-list');

        list.innerHTML = orders.map(order => `
            <tr>
                <td><b>#ORD${order.id}</b></td>
                <td>${new Date(order.created_at).toLocaleString('vi-VN')}</td>
                <td>User ID: ${order.user_id}</td>
                <td style="color: #d70018; font-weight: bold;">${parseFloat(order.total_price).toLocaleString()}đ</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
                <td>
                    <button class="btn-detail" onclick="viewDetail(${order.id})">Xem</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const res = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
        alert("Cập nhật trạng thái thành công!");
    }
}

async function viewDetail(orderId) {
    // Bạn có thể dùng lại logic Modal hoặc đơn giản là alert/console log trước
    // Để chuyên nghiệp, hãy tạo một Modal tương tự bên trang người dùng
    alert("Xem chi tiết đơn hàng: " + orderId);
    
    // Logic gợi ý: Fetch API detail và hiện Popup
    // const res = await fetch(`http://localhost:3000/api/orders/detail/${orderId}`);
    // const data = await res.json();
    // ... hiển thị lên màn hình ...
}