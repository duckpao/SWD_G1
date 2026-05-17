// Sử dụng Sequelize kết nối của bạn từ config/db
const { sequelize } = require('../config/db'); 

// Hàm kiểm tra trùng lặp Email dưới database
const checkEmailExists = async (email) => {
  const [rows] = await sequelize.query(
    'SELECT id FROM users WHERE email = ?',
    { replacements: [email] }
  );
  return rows.length > 0;
};

// Hàm chạy lệnh INSERT lưu dữ liệu mộc vào bảng
const saveAdminUser = async (userData) => {
  const { fullname, email, password, role, status } = userData;
  
  await sequelize.query(
    'INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
    {
      replacements: [fullname, email, password, role, status]
    }
  );
};

module.exports = { checkEmailExists, saveAdminUser };