const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db'); // Import hàm kết nối database
const authRoutes = require('./routes/auth'); // Import router auth của bạn

const app = express();
const PORT = 5000;

// 1. Cấu hình các Middleware hệ thống (Phải đặt TRƯỚC khi định nghĩa Route)
app.use(cors());
app.use(express.json()); // Bắt buộc phải có để Postman gửi JSON lên Express đọc được

// 2. Kết nối Database MySQL
connectDB();

// 3. Đăng ký các API Routes
app.use('/api/auth', authRoutes); // Định tuyến tất cả API liên quan đến login, register

// Route kiểm tra server cơ bản
app.get('/', (req, res) => {
    res.send('Backend Fruit Shop đang chạy ngon lành!');
});

// 4. Khởi chạy Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng thành công: http://localhost:${PORT}`);
});