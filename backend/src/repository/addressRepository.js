const { sequelize } = require("../config/db");

const findByUser = async (userId) => {
  const [rows] = await sequelize.query("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", { replacements: [userId] });
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await sequelize.query("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?", { replacements: [id, userId] });
  return rows[0] || null;
};

const create = async (data) => {
  if (data.is_default) {
    await sequelize.query("UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?", { replacements: [data.user_id] });
  }
  const [result] = await sequelize.query("INSERT INTO user_addresses (user_id, recipient_name, phone, street_address, ward, district, city, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", { replacements: [data.user_id, data.recipient_name, data.phone, data.street_address, data.ward, data.district, data.city, data.is_default ? 1 : 0] });
  const id = typeof result === "number" ? result : result.insertId;
  return await findById(id, data.user_id);
};

const update = async (id, userId, data) => {
  if (data.is_default) {
    await sequelize.query("UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?", { replacements: [userId] });
  }
  await sequelize.query("UPDATE user_addresses SET recipient_name = ?, phone = ?, street_address = ?, ward = ?, district = ?, city = ?, is_default = ? WHERE id = ? AND user_id = ?", { replacements: [data.recipient_name, data.phone, data.street_address, data.ward, data.district, data.city, data.is_default ? 1 : 0, id, userId] });
};

const remove = async (id, userId) => {
  await sequelize.query("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", { replacements: [id, userId] });
};

const setDefault = async (id, userId) => {
  await sequelize.query("UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?", { replacements: [userId] });
  await sequelize.query("UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?", { replacements: [id, userId] });
};

module.exports = { findByUser, findById, create, update, remove, setDefault };
