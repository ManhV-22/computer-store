// orderController.js
// Thêm hàm updateOrder vào cuối file orderController.js
exports.updateOrder = (req, res) => {
    const orderId = req.params.id;
    const { phone, address } = req.body;

    // Lệnh SQL để cập nhật số điện thoại và địa chỉ theo ID đơn hàng
    const sql = 'UPDATE orders SET phone = ?, address = ? WHERE id = ?';

    db.query(sql, [phone, address, orderId], (err, result) => {
        if (err) {
            console.error("Lỗi khi cập nhật đơn hàng:", err);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lưu thay đổi!' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        res.json({ success: true, message: 'Cập nhật đơn hàng thành công!' });
    });
};