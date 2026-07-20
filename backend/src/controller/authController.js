const RegisterUserRequest = require("../dto/request/RegisterUserRequest");
const RegisterAdminRequest = require("../dto/request/RegisterAdminRequest");
const UserResponse = require("../dto/response/UserResponse");
const authService = require("../service/authService");
const userRepository = require("../repository/userRepository");

const registerAdmin = async (req, res) => {
  try {
    const r = new RegisterAdminRequest(req.body); r.validate();
    if (r.adminSecret !== "duckpao") return res.status(403).json({ message: "Sai mã bí mật admin!" });
    const user = await authService.handleAdminRegistration({ email: r.email, password: r.password, name: r.name });
    return res.status(201).json(new UserResponse(user));
  } catch (e) { console.error("Lỗi registerAdmin:", e.message); return res.status(500).json({ message: "Lỗi hệ thống" }); }
};

const registerUser = async (req, res) => {
  try {
    const r = new RegisterUserRequest(req.body); r.validate();
    const user = await authService.handleUserRegistration({ email: r.email, password: r.password, name: r.name, phone: r.phone, address: r.address });
    return res.status(201).json(new UserResponse(user));
  } catch (e) { console.error("Lỗi registerUser:", e.message); return res.status(500).json({ message: "Lỗi hệ thống" }); }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
    const result = await authService.handleLogin(email, password, rememberMe);
    return res.json(result);
  } catch (e) { console.error("Lỗi login:", e.message); return res.status(401).json({ message: "Đăng nhập thất bại", error: e.message }); }
};

const getProfile = async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });
    return res.json(new UserResponse(user));
  } catch (e) { console.error("Lỗi getProfile:", e.message); return res.status(500).json({ message: "Lỗi lấy thông tin" }); }
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ["fullname", "phone", "address", "avatar_url", "date_of_birth"];
    const data = {};
    for (const k of allowed) { if (req.body[k] !== undefined) data[k] = req.body[k]; }
    if (Object.keys(data).length === 0) return res.status(400).json({ message: "Không có dữ liệu cập nhật!" });
    await userRepository.updateProfile(req.user.id, data);
    const user = await userRepository.findById(req.user.id);
    return res.json(new UserResponse(user));
  } catch (e) { console.error("Lỗi updateProfile:", e.message); return res.status(500).json({ message: "Lỗi cập nhật" }); }
};

const logout = async (req, res) => {
  try { return res.json({ message: "Đăng xuất thành công!" }); } catch (e) { return res.status(500).json({ message: "Lỗi đăng xuất" }); }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Thiếu email!" });
    await authService.requestPasswordReset(email);
    return res.json({ message: "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi!" });
  } catch (e) { return res.json({ message: "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi!" }); }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới!" });
    if (password.length < 6) return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    await authService.resetPassword(token, password);
    return res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (e) { return res.status(400).json({ message: e.message }); }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Thiếu token!" });
    const user = await authService.processActivation(token);
    return res.json({ message: "Kích hoạt tài khoản thành công!", user: new UserResponse(user) });
  } catch (e) { return res.status(400).json({ message: "Kích hoạt thất bại", error: e.message }); }
};

module.exports = { registerAdmin, registerUser, login, getProfile, updateProfile, logout, requestPasswordReset, resetPassword, activateAccount };