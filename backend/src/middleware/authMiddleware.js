const jwt = require('jsonwebtoken');

// Khóa bí mật để ký Token (Trong thực tế nên để ở file .env)
const JWT_SECRET = 'my_super_secret_fruit_shop_key';

const protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem token có nằm trong Header (Authorization: Bearer <token>) không
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy chuỗi Token sau chữ 'Bearer '
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Đính kèm thông tin user vào request để các hàm phía sau sử dụng
      req.user = {
        id: decoded.id,
        role: decoded.role // 'customer', 'shop_owner', hoặc 'admin'
      };

      // Cho phép request đi tiếp vào controller/route
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy Token, quyền truy cập bị từ chối!' });
  }
};

// Phân quyền nâng cao (Ví dụ chỉ cho phép Admin hoặc Shop Owner vào)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
    }
    next();
  };
};

module.exports = { protect, authorize };