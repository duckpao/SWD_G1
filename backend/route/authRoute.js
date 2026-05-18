const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Tuyến đường đăng ký Admin: Chỉ định cấu trúc và ánh xạ sang hàm trong Controller
router.post('/register-admin', authController.registerAdmin);
router.post('/register', authController.registerUser);

module.exports = router;