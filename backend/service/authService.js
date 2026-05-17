const bcrypt = require('bcryptjs');
const userRepository = require('../repository/userRepository');

const handleAdminRegistration = async (adminData) => {
  const { email, password, name } = adminData;

  // Thuật toán 1: Kiểm tra sự tồn tại của Email thông qua tầng Repository
  const isEmailExist = await userRepository.checkEmailExists(email);
  if (isEmailExist) {
    throw new Error('Email này đã được sử dụng trong hệ thống!');
  }

  // Thuật toán 2: Mã hóa mật khẩu bảo mật
  const hashedPassword = await bcrypt.hash(password, 10);

  // Thuật toán 3: Gọi Repository để lưu tài khoản vào Database ảo với trạng thái 'active' và quyền 'admin'
  await userRepository.saveAdminUser({
    fullname: name,
    email: email,
    password: hashedPassword,
    role: 'admin',
    status: 'active'
  });

  // Có thể bổ sung thêm thuật toán đẩy vào Kafka tại đây...

  return { message: 'Tạo tài khoản Admin thành công!' };
};

module.exports = { handleAdminRegistration };