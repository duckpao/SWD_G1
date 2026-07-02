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
    console.error("Lá»—i registerAdmin:", error.message);
    return res
      .status(500)
      .json({ message: "Lá»—i há»‡ thá»‘ng", error: error.message });
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
    console.error("Lá»—i registerUser:", error.message);
    return res
      .status(500)
      .json({ message: "Lá»—i há»‡ thá»‘ng", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email vÃ  máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!" });
    }

    const result = await authService.handleLogin(email, password);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lá»—i login:", error.message);
    const statusCode = error.message.includes("khÃ´ng tá»“n táº¡i") ? 404 : 401;
    return res
      .status(statusCode)
      .json({ message: "ÄÄƒng nháº­p tháº¥t báº¡i", error: error.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Thiáº¿u mÃ£ xÃ¡c thá»±c (token) trÃªn Ä‘Æ°á»ng dáº«n!" });
    }

    const result = await authService.processActivation(token);
    const response = new UserResponse(result);

    return res.status(200).json({
      message: "KÃ­ch hoáº¡t tÃ i khoáº£n thÃ nh cÃ´ng!",
      user: response,
    });
  } catch (error) {
    console.error("Lá»—i activateAccount:", error.message);
    const statusCode = error.message.includes("khÃ´ng há»£p lá»‡") ? 400 : 500;
    return res.status(statusCode).json({
      message: "KÃ­ch hoáº¡t tÃ i khoáº£n tháº¥t báº¡i",
      error: error.message,
    });
  }
};

module.exports = { registerAdmin, registerUser, login, activateAccount };