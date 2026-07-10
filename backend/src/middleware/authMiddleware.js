const jwt = require("jsonwebtoken");

const JWT_SECRET = "my_super_secret_fruit_shop_key";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy Token, quyền truy cập bị từ chối!" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thực hiện hành động này!" });
    }
    next();
  };
};

module.exports = { protect, authorize };