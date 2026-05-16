const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendActivationEmail } = require('../config/mail');

const Redis = require('redis');
const redisClient = Redis.createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error); // Tự kết nối ngầm

// Import kết nối DB và Redis từ các file bạn đã tạo trước đó
const { sequelize } = require('../config/db'); 
// const { redisClient } = require('../worker'); // Hoặc file config redis riêng của bạn

// 1. ĐĂNG KÝ USER MỚI (Mặc định role = 'customer', trạng thái = 'PENDING')
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check xem email đã tồn tại trong MySQL chưa
    const [existingUser] = await sequelize.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu User vào MySQL với trạng thái PENDING (chưa kích hoạt)
    const [result] = await sequelize.query(
      'INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'customer', 'PENDING']
    );

    // Tạo một Token ngẫu nhiên để xác thực email
    const activationToken = crypto.randomBytes(32).toString('hex');

    // LƯU TOKEN VÀO REDIS: Key là token, Value là email. Hết hạn sau 10 phút (600 giây)
    // Giúp hệ thống check cực nhanh khi user click vào link
    await redisClient.set(`activate:${activationToken}`, email, { EX: 600 });

    // Gửi email chứa token (Trong thực tế nên đẩy việc này vào Kafka để API phản hồi ngay lập tức)
    await sendActivationEmail(email, activationToken);

    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
});

// 2. TẠO ADMIN MỚI (Chỉ nên cho phép từ hệ thống nội bộ hoặc cần phân quyền đặc biệt)
router.post('/register-admin', async (req, res) => {
  const { email, password, name, adminSecret } = req.body;

  // Lớp bảo mật thủ công: Phải truyền đúng mã bí mật mới cho tạo Admin
  if (adminSecret !== 'duckpao') {
    return res.status(403).json({ message: 'Bạn không có quyền tạo tài khoản Admin!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Admin có thể active luôn hoặc vẫn cần xác thực email tùy bạn (ở đây cho ACTIVE luôn)
await sequelize.query(
    'INSERT INTO users (email, password, fullyname, role, status) VALUES (:email, :password, :name, :role, :status)',
    {
      replacements: {
        email: email,
        password: hashedPassword,
        name: name,
        role: 'admin',
        status: 'ACTIVE'
      },
      type: QueryTypes.INSERT
    }
  );

    res.status(201).json({ message: 'Tạo tài khoản Admin thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
});

// 3. API XÁC THỰC EMAIL (Khi user click vào link trong Gmail)
router.get('/activate', async (req, res) => {
  const { token } = req.query;

  try {
    // Đọc token từ Redis xem có hợp lệ hoặc đã hết hạn chưa
    const email = await redisClient.get(`activate:${token}`);
    
    if (!email) {
      return res.status(400).send('<h3>Link xác thực không hợp lệ hoặc đã hết hạn (quá 10 phút)!</h3>');
    }

    // Cập nhật trạng thái user thành ACTIVE trong MySQL
    await sequelize.query('UPDATE users SET status = ? WHERE email = ?', ['ACTIVE', email]);

    // Xóa token khỏi Redis sau khi đã dùng xong
    await redisClient.del(`activate:${token}`);

    // Trả về giao diện thông báo thành công (hoặc redirect về trang login của React)
    res.send('<h3>Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.</h3>');
  } catch (error) {
    res.status(500).send('Lỗi xác thực hệ thống.');
  }
});

module.exports = router;