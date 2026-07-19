const { sequelize } = require("../config/db");

const checkEmailExists = async (email) => {
  const [rows] = await sequelize.query("SELECT id FROM users WHERE email = ?", { replacements: [email] });
  return rows.length > 0;
};

const saveAdminUser = async (userData) => {
  const { fullname, email, password, role, status } = userData;
  await sequelize.query("INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)", { replacements: [fullname, email, password, role, status] });
  const [rows] = await sequelize.query("SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?", { replacements: [email] });
  return rows[0];
};

const saveNormalUser = async (userData) => {
  const { fullname, email, password, phone, address, role, status } = userData;
  await sequelize.query("INSERT INTO users (fullname, email, password, phone, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)", { replacements: [fullname, email, password, phone || null, address || null, role || "user", status || "active"] });
  const [rows] = await sequelize.query("SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?", { replacements: [email] });
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await sequelize.query("SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?", { replacements: [email] });
  return rows.length > 0 ? rows[0] : null;
};

const findById = async (id) => {
  const [rows] = await sequelize.query("SELECT id, fullname, email, password, phone, address, avatar_url, date_of_birth, role, status, created_at FROM users WHERE id = ?", { replacements: [parseInt(id)] });
  return rows.length > 0 ? rows[0] : null;
};

const updateStatus = async (id, newStatus) => {
  await sequelize.query("UPDATE users SET status = ? WHERE id = ?", { replacements: [newStatus, parseInt(id)] });
  return findById(id);
};

const updateProfile = async (userId, data) => {
  const sets = []; const vals = [];
  if (data.fullname) { sets.push("fullname = ?"); vals.push(data.fullname); }
  if (data.phone) { sets.push("phone = ?"); vals.push(data.phone); }
  if (data.address) { sets.push("address = ?"); vals.push(data.address); }
  if (data.avatar_url) { sets.push("avatar_url = ?"); vals.push(data.avatar_url); }
  if (data.date_of_birth) { sets.push("date_of_birth = ?"); vals.push(data.date_of_birth); }
  if (sets.length === 0) return;
  vals.push(userId);
  await sequelize.query("UPDATE users SET " + sets.join(", ") + " WHERE id = ?", { replacements: vals });
};

const savePasswordReset = async (userId, token, expiresAt) => {
  await sequelize.query("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)", { replacements: [userId, token, expiresAt] });
};

const findResetToken = async (token) => {
  const [rows] = await sequelize.query("SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() AND used_at IS NULL ORDER BY created_at DESC LIMIT 1", { replacements: [token] });
  return rows[0] || null;
};

const markResetUsed = async (id) => {
  await sequelize.query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", { replacements: [id] });
};

const updatePassword = async (userId, hashedPassword) => {
  await sequelize.query("UPDATE users SET password = ? WHERE id = ?", { replacements: [hashedPassword, userId] });
};

module.exports = { checkEmailExists, saveAdminUser, saveNormalUser, findByEmail, findById, updateStatus, updateProfile, savePasswordReset, findResetToken, markResetUsed, updatePassword };