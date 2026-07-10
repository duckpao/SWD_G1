const { sequelize } = require("../config/db");

const findByCode = async (code) => {
  const [rows] = await sequelize.query("SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW()) AND (usage_limit = 0 OR used_count < usage_limit)", { replacements: [code] });
  return rows[0] || null;
};

const incrementUsed = async (id) => {
  await sequelize.query("UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?", { replacements: [id] });
};

module.exports = { findByCode, incrementUsed };