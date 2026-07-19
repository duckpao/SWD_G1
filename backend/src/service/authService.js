const bcrypt = require("bcryptjs");
const Redis = require("redis");
const crypto = require("crypto");
const userRepository = require("../repository/userRepository");
const { sendActivationEmail } = require("../config/mail");

const redisClient = Redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect().catch(console.error);

const handleAdminRegistration = async (data) => {
  if (await userRepository.checkEmailExists(data.email)) throw new Error("Email đã được sử dụng!");
  const pwd = await bcrypt.hash(data.password, 10);
  return await userRepository.saveAdminUser({ fullname: data.name, email: data.email, password: pwd, role: "admin", status: "active" });
};

const handleUserRegistration = async (data) => {
  if (await userRepository.checkEmailExists(data.email)) throw new Error("Email đã được đăng ký!");
  const pwd = await bcrypt.hash(data.password, 10);
  const user = await userRepository.saveNormalUser({ fullname: data.name, email: data.email, password: pwd, phone: data.phone, address: data.address, role: "user", status: "inactive" });
  const token = crypto.randomBytes(32).toString("hex");
  await redisClient.set(`activation:${token}`, String(user.id), { EX: 900 });
  sendActivationEmail(data.email, token).catch(console.error);
  return user;
};

const handleLogin = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Email không tồn tại!");
  if (user.status !== "active") throw new Error("Tài khoản chưa được kích hoạt!");
  if (!(await bcrypt.compare(password, user.password))) throw new Error("Mật khẩu không chính xác!");
  const jwt = require("jsonwebtoken");
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "my_super_secret_fruit_shop_key", { expiresIn: "7d" });
  return { token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role } };
};

const requestPasswordReset = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return; // Khong tiet lo email ton tai hay khong
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phut
  await userRepository.savePasswordReset(user.id, token, expiresAt);
  // TODO: Gui email reset password (tuong tu sendActivationEmail)
};

const resetPassword = async (token, newPassword) => {
  const record = await userRepository.findResetToken(token);
  if (!record) throw new Error("Token không hợp lệ hoặc đã hết hạn!");
  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(record.user_id, hashed);
  await userRepository.markResetUsed(record.id);
};

const processActivation = async (token) => {
  const userId = await redisClient.get(`activation:${token}`);
  if (!userId) throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn!");
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Tài khoản không tồn tại!");
  if (user.status === "active") { await redisClient.del(`activation:${token}`); return user; }
  const updated = await userRepository.updateStatus(userId, "active");
  await redisClient.del(`activation:${token}`);
  return updated;
};

module.exports = { handleAdminRegistration, handleUserRegistration, handleLogin, requestPasswordReset, resetPassword, processActivation };