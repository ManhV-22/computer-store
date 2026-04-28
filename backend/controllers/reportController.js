// Đừng quên import kết nối Database của bạn vào đây nhé!
// (Sửa lại đường dẫn '../config/db' cho đúng với dự án của bạn)
const db = require('../config/db'); 

exports.getSummaryReports = async (req, res) => {
    try {
        // 1. Lấy tham số time từ Frontend, mặc định là năm nay ('year')
        const timeFilter = req.query.time || 'year';
        let dateCondition = '';

        // 2. Tạo điều kiện lọc SQL tương ứng
        if (timeFilter === 'today') {
            dateCondition = "DATE(created_at) = CURDATE()"; // Hôm nay
        } else if (timeFilter === 'week') {
            dateCondition = "YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)"; // Tuần này
        } else if (timeFilter === 'month') {
            dateCondition = "MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())"; // Tháng này
        } else if (timeFilter === 'year') {
            dateCondition = "YEAR(created_at) = YEAR(CURDATE())"; // Năm nay
        } else {
            dateCondition = "1=1"; // Nếu truyền sai thì lấy tất cả
        }

        // 3. Viết các câu lệnh SQL
        // Giả sử bảng đơn hàng là 'orders', cột tổng tiền là 'total_price', cột trạng thái là 'status'
        const summaryQuery = `
            SELECT 
                IFNULL(SUM(total_price), 0) AS totalRevenue,
                COUNT(id) AS totalOrders
            FROM orders 
            WHERE status = 'completed' AND ${dateCondition}
        `;

        // Giả sử bảng người dùng là 'users', cột phân quyền là 'role' = 'user'
        const customerQuery = `
            SELECT COUNT(id) AS totalCustomers 
            FROM users 
            WHERE role = 'user' AND ${dateCondition}
        `;

        // Lấy dữ liệu cho biểu đồ đường (Gom nhóm theo ngày)
        const chartQuery = `
            SELECT 
                DATE_FORMAT(created_at, '%d/%m') AS date,
                SUM(total_price) AS revenue
            FROM orders
            WHERE status = 'completed' AND ${dateCondition}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `;

        // 4. Thực thi các câu lệnh SQL
        // (Lưu ý: Nếu db của bạn chưa dùng promise, bạn có thể phải dùng db.promise().query)
        const [summaryResult] = await db.promise().query(summaryQuery);
        const [customerResult] = await db.promise().query(customerQuery);
        const [chartResult] = await db.promise().query(chartQuery);

        // 5. Trả về đúng JSON mà Frontend đang cần
        res.json({
            success: true,
            totalRevenue: summaryResult[0].totalRevenue, // Số tiền
            totalOrders: summaryResult[0].totalOrders,   // Số đơn
            totalCustomers: customerResult[0].totalCustomers, // Số khách
            chartData: chartResult // Mảng dữ liệu biểu đồ
        });

    } catch (error) {
        console.error("Lỗi lấy báo cáo thống kê:", error);
        res.status(500).json({ success: false, message: "Lỗi truy xuất cơ sở dữ liệu." });
    }
};