const bcrypt = require("bcryptjs");
const Redis = require("redis");
const crypto = require("crypto");
const userRepository = require("../repository/userRepository");
const { sendActivationEmail } = require("../config/mail");

const redisClient = Redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect().catch(console.error);

const handleAdminRegistration = async (adminData) => {
  const { email, password, name } = adminData;

  const isEmailExist = await userRepository.checkEmailExists(email);
  if (isEmailExist) {
    throw new Error("Email này đã được sử dụng trong hệ thống!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.saveAdminUser({
    fullname: name,
    email: email,
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  return newUser;
};

const handleUserRegistration = async (userData) => {
  const { email, password, name, phone, address } = userData;

  const isEmailExist = await userRepository.checkEmailExists(email);
  if (isEmailExist) {
    throw new Error("Email này đã được đăng ký bởi khách hàng khác!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.saveNormalUser({
    fullname: name,
    email: email,
    password: hashedPassword,
    phone: phone,
    address: address,
    role: "user",
    status: "inactive",
  });

  // Tạo activation token và lưu vào Redis (TTL 15 phút)
  const token = crypto.randomBytes(32).toString("hex");
  await redisClient.set(`activation:${token}`, String(newUser.id), { EX: 900 });

  // Gửi email kích hoạt bất đồng bộ (không await để không chậm response)
  sendActivationEmail(email, token).catch(console.error);

  return newUser;
};

const handleLogin = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống!");
  }

  if (user.status !== "active") {
    throw new Error("Tài khoản chưa được kích hoạt!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Mật khẩu không chính xác!");
  }

  const jwt = require("jsonwebtoken");
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "my_super_secret_fruit_shop_key",
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
  };
};

const processActivation = async (token) => {
  const redisKey = `activation:${token}`;
  const userId = await redisClient.get(redisKey);

  if (!userId) {
    throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn sử dụng!");
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("Tài khoản liên kết với mã xác thực này không tồn tại!");
  }

  if (user.status === "active") {
    await redisClient.del(redisKey);
    return user;
  }

  const updatedUser = await userRepository.updateStatus(userId, "active");
  await redisClient.del(redisKey);
  return updatedUser;
};

module.exports = {
  handleAdminRegistration,
  handleUserRegistration,
  handleLogin,
  processActivation,
};