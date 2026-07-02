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
    throw new Error("Email nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng trong há»‡ thá»‘ng!");
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
    throw new Error("Email nÃ y Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ bá»Ÿi má»™t khÃ¡ch hÃ ng khÃ¡c!");
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

  // Táº¡o activation token vÃ  lÆ°u vÃ o Redis (TTL 15 phÃºt)
  const token = crypto.randomBytes(32).toString("hex");
  await redisClient.set(`activation:${token}`, String(newUser.id), { EX: 900 });

  // Gá»­i email kÃ­ch hoáº¡t báº¥t Ä‘á»“ng bá»™ (khÃ´ng await Ä‘á»ƒ khÃ´ng cháº­m response)
  sendActivationEmail(email, token).catch(console.error);

  return newUser;
};

const handleLogin = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Email khÃ´ng tá»“n táº¡i trong há»‡ thá»‘ng!");
  }

  if (user.status !== "active") {
    throw new Error("TÃ i khoáº£n chÆ°a Ä‘Æ°á»£c kÃ­ch hoáº¡t!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c!");
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
    throw new Error("MÃ£ xÃ¡c thá»±c khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n sá»­ dá»¥ng!");
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error(
      "TÃ i khoáº£n liÃªn káº¿t vá»›i mÃ£ xÃ¡c thá»±c nÃ y khÃ´ng tá»“n táº¡i!"
    );
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