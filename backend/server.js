const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoute'); 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Kết nối database MySQL Docker (Cổng 3307)
connectDB();

// Đăng ký API Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Backend Fruit Shop tổ chức cấu hình MVC/Service-Repository thành công!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy mượt mà tại: http://localhost:${PORT}`);
});