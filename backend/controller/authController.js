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
const registerUser = async (req, res) => {
  const { email, password, name, phone, address } = req.body;

  // Kiểm tra các trường bắt buộc phải có
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Lỗi: Thiếu thông tin email, mật khẩu hoặc họ tên!' });
  }

  try {
    // Đẩy xuống tầng Service giải thuật toán
    const result = await authService.handleUserRegistration({ email, password, name, phone, address });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error("❌ Lỗi tại Tầng Controller (User):", error.message);
    return res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
};

module.exports = { registerAdmin,registerUser };