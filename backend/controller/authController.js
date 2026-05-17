const authService = require('../service/authService');

const registerAdmin = async (req, res) => {
  const { email, password, name, adminSecret } = req.body;

  // Validation dữ liệu đầu vào cơ bản
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Lỗi: Vui lòng nhập đầy đủ các trường bắt buộc!' });
  }

  // Khớp mã bảo mật thủ công
  if (adminSecret !== 'duckpao') {
    return res.status(403).json({ message: 'Lọc chặn: Bạn không có quyền tạo tài khoản Admin!' });
  }

  try {
    // Chuyển toàn bộ logic thuật toán xử lý xuống cho tầng Service
    const result = await authService.handleAdminRegistration({ email, password, name });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error("❌ Lỗi tại Tầng Controller:", error.message);
    return res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
};

module.exports = { registerAdmin };