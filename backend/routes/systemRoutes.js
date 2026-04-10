// routes/systemRoutes.js
const express = require("express");
const router = express.Router();
const os = require('os');
const db = require("../config/db");

router.get('/status', async (req, res) => {
    try {
        // Tính toán phần trăm RAM sử dụng thực tế
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const ramUsage = (((totalMem - freeMem) / totalMem) * 100).toFixed(0);

        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            cpuModel: os.cpus()[0].model,
            totalMemory: (totalMem / (1024 ** 3)).toFixed(2) + " GB",
            freeMemory: (freeMem / (1024 ** 3)).toFixed(2) + " GB",
            ramUsage: ramUsage + "%",
            uptime: (os.uptime() / 3600).toFixed(2), // Đơn vị giờ
            nodeVersion: process.version,
            dbStatus: "Đã kết nối"
        };
        res.json({ success: true, data: systemInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
});

module.exports = router;