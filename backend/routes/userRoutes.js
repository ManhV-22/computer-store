const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Quản lý đăng nhập / đăng ký
router.post('/register', userController.register);
router.post('/login', userController.login);

// Lấy danh sách user & cập nhật trạng thái
router.get('/', userController.getAllUsers);
router.put('/:id/status', userController.changeStatus);

// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/status', userController.toggleUserStatus);

module.exports = router;