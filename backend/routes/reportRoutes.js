// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/summary', async (req, res) => {
    try {
        // 1. Tính tổng doanh thu và tổng số đơn hàng (chỉ tính đơn đã hoàn thành hoặc đang giao)
        const [orderStats] = await db.query(`
            SELECT 
                SUM(total_price) as totalRevenue, 
                COUNT(id) as totalOrders 
            FROM \`order\` 
            WHERE status != 'cancelled'
        `);

        // 2. Tính tổng số khách hàng (người dùng có role = 'user' hoặc 'customer')
        const [userStats] = await db.query(`
            SELECT COUNT(id) as totalCustomers 
            FROM users 
            WHERE role != 'admin'
        `);

        // 3. Lấy dữ liệu doanh thu theo 7 ngày gần nhất để vẽ biểu đồ
        const [chartData] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%d/%m') as date, 
                SUM(total_price) as revenue 
            FROM \`order\` 
            WHERE status != 'cancelled' 
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at) ASC 
            LIMIT 7
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