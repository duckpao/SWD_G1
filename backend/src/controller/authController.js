const RegisterUserRequest = require("../dto/request/RegisterUserRequest");
const RegisterAdminRequest = require("../dto/request/RegisterAdminRequest");
const UserResponse = require("../dto/response/UserResponse");
const authService = require("../service/authService");

const registerAdmin = async (req, res) => {
  try {
    const adminRequest = new RegisterAdminRequest(req.body);
    adminRequest.validate();

    if (adminRequest.adminSecret !== "duckpao") {
      return res
        .status(403)
        .json({ message: "Unauthorize account, wrong admin secret!" });
    }

    const newAdmin = await authService.handleAdminRegistration({
      email: adminRequest.email,
      password: adminRequest.password,
      name: adminRequest.name,
    });

    const response = new UserResponse(newAdmin);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Lỗi registerAdmin:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống", error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const userRequest = new RegisterUserRequest(req.body);
    userRequest.validate();

    const newUser = await authService.handleUserRegistration({
      email: userRequest.email,
      password: userRequest.password,
      name: userRequest.name,
      phone: userRequest.phone,
      address: userRequest.address,
    });

    const response = new UserResponse(newUser);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Lỗi registerUser:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password must not empty!" });
    }

    const result = await authService.handleLogin(email, password);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi login:", error.message);
    const statusCode = error.message.includes("Không tồn tại") ? 404 : 401;
    return res
      .status(statusCode)
      .json({ message: "Đăng nhập thất bại", error: error.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Thiếu token!" });
    }

    const result = await authService.processActivation(token);
    const response = new UserResponse(result);

    return res.status(200).json({
      message: "Kích hoạt tài khoản thành công!",
      user: response,
    });
  } catch (error) {
    console.error("Lỗi activateAccount:", error.message);
    const statusCode = error.message.includes("không tồn tại") ? 400 : 500;
    return res.status(statusCode).json({
      message: "Kích hoạt tài khoản thành công",
      error: error.message,
    });
  }
};

module.exports = { registerAdmin, registerUser, login, activateAccount };