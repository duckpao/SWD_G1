// Sá»­ dá»¥ng Sequelize káº¿t ná»‘i cá»§a báº¡n tá»« config/db
const { sequelize } = require("../config/db");

// HÃ m kiá»ƒm tra trÃ¹ng láº·p Email dÆ°á»›i database
const checkEmailExists = async (email) => {
  const [rows] = await sequelize.query(
    "SELECT id FROM users WHERE email = ?",
    { replacements: [email] }
  );
  return rows.length > 0;
};

// HÃ m cháº¡y lá»‡nh INSERT lÆ°u dá»¯ liá»‡u má»™c vÃ o báº£ng
const saveAdminUser = async (userData) => {
  const { fullname, email, password, role, status } = userData;

  await sequelize.query(
    "INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
    {
      replacements: [fullname, email, password, role, status],
    }
  );

  const [rows] = await sequelize.query(
    "SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?",
    { replacements: [email] }
  );
  return rows[0];
};

const saveNormalUser = async (userData) => {
  const { fullname, email, password, phone, address, role, status } = userData;
  await sequelize.query(
    "INSERT INTO users (fullname, email, password, phone, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    {
      replacements: [
        fullname,
        email,
        password,
        phone || null,
        address || null,
        role || "user",
        status || "active",
      ],
    }
  );

  const [rows] = await sequelize.query(
    "SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?",
    { replacements: [email] }
  );
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await sequelize.query(
    "SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE email = ?",
    { replacements: [email] }
  );
  return rows.length > 0 ? rows[0] : null;
};

const findById = async (id) => {
  const [rows] = await sequelize.query(
    "SELECT id, fullname, email, password, phone, address, role, status, created_at FROM users WHERE id = ?",
    { replacements: [parseInt(id)] }
  );
  return rows.length > 0 ? rows[0] : null;
};

const updateStatus = async (id, newStatus) => {
  await sequelize.query("UPDATE users SET status = ? WHERE id = ?", {
    replacements: [newStatus, parseInt(id)],
  });
  return findById(id);
};

module.exports = {
  checkEmailExists,
  saveAdminUser,
  saveNormalUser,
  findByEmail,
  findById,
  updateStatus,
};