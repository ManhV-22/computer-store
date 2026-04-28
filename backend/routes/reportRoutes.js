// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/summary', async (req, res) => {
    try {
        // 0. Bắt tham số time từ Frontend gửi lên, mặc định là 'year'
        const timeFilter = req.query.time || 'year';
        let dateCondition = '';

        // Tạo điều kiện lọc SQL cho MySQL
        if (timeFilter === 'today') {
            dateCondition = "DATE(created_at) = CURDATE()";
        } else if (timeFilter === 'week') {
            dateCondition = "YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
        } else if (timeFilter === 'month') {
            dateCondition = "MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
        } else if (timeFilter === 'year') {
            dateCondition = "YEAR(created_at) = YEAR(CURDATE())";
        } else {
            dateCondition = "1=1"; // Trường hợp dự phòng
        }

        // 1. Tính tổng doanh thu và tổng số đơn hàng (Kèm theo lọc ngày)
        const [orderStats] = await db.query(`
            SELECT 
                SUM(total_price) as totalRevenue, 
                COUNT(id) as totalOrders 
            FROM \`order\` 
            WHERE status != 'cancelled' AND ${dateCondition}
        `);

        // 2. Tính tổng số khách hàng (Kèm theo lọc ngày)
        const [userStats] = await db.query(`
            SELECT COUNT(id) as totalCustomers 
            FROM users 
            WHERE role != 'admin' AND ${dateCondition}
        `);

        // 3. Lấy dữ liệu doanh thu để vẽ biểu đồ (Kèm theo lọc ngày và BỎ LIMIT 7)
        // Lưu ý: Mình đã bỏ LIMIT 7 đi, vì nếu lọc theo tháng/năm thì cần trả về hết các ngày có đơn hàng
        const [chartData] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%d/%m') as date, 
                SUM(total_price) as revenue 
            FROM \`order\` 
            WHERE status != 'cancelled' AND ${dateCondition}
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at) ASC 
        `);

        res.json({
            success: true,
            totalRevenue: orderStats[0].totalRevenue || 0,
            totalOrders: orderStats[0].totalOrders || 0,
            totalCustomers: userStats[0].totalCustomers || 0,
            chartData: chartData // Mảng chứa {date, revenue}
        });

    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

module.exports = router;