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

const handleUserRegistration = async (userData) => {
  const { email, password, name, phone, address } = userData;

  // Thuật toán 1: Kiểm tra trùng lặp tài khoản
  const isEmailExist = await userRepository.checkEmailExists(email);
  if (isEmailExist) {
    throw new Error('Email này đã được đăng ký bởi một khách hàng khác!');
  }

  // Thuật toán 2: Mã hóa mật khẩu bảo mật trước khi đưa xuống DB
  const hashedPassword = await bcrypt.hash(password, 10);

  // Thuật toán 3: Gọi Repository để ghi dữ liệu mộc xuống MySQL
  await userRepository.saveNormalUser({
    fullname: name,
    email: email,
    password: hashedPassword,
    phone: phone,
    address: address,
    role: 'user',       // Cố định role là khách mua hàng
    status: 'active'    // Trạng thái hoạt động mặc định
  });

  // 💡 Nơi cài cắm điểm cộng SWD: 
  // Bạn có thể viết thêm lệnh đẩy một Message vào Kafka cluster tại đây để báo cho Worker gửi Email ngầm.

  return { message: 'Khách hàng đăng ký tài khoản thành công từ tầng Service!' };
};

module.exports = { handleAdminRegistration, handleUserRegistration };