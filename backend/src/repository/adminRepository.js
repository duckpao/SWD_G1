const { sequelize } = require("../config/db");

const findAllUsers = async (role) => {
  if (role) {
    const [rows] = await sequelize.query("SELECT id, fullname, email, phone, address, role, status, created_at, last_login_at FROM users WHERE role = ? ORDER BY created_at DESC", { replacements: [role] });
    return rows;
  }
  const [rows] = await sequelize.query("SELECT id, fullname, email, phone, address, role, status, created_at, last_login_at FROM users ORDER BY created_at DESC");
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await sequelize.query("SELECT id, fullname, email, phone, address, role, status, created_at, last_login_at FROM users WHERE id = ?", { replacements: [id] });
  return rows[0] || null;
};

const updateUserStatus = async (id, status) => {
  await sequelize.query("UPDATE users SET status = ? WHERE id = ?", { replacements: [status, id] });
};

const findAllOrders = async () => {
  const [rows] = await sequelize.query("SELECT o.*, u.fullname as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
  return rows;
};

const findOrderById = async (id) => {
  const [rows] = await sequelize.query("SELECT o.*, u.fullname as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?", { replacements: [id] });
  return rows[0] || null;
};

const updateOrderStatus = async (id, status, paymentStatus) => {
  if (paymentStatus) {
    await sequelize.query("UPDATE orders SET status = ?, payment_status = ? WHERE id = ?", { replacements: [status, paymentStatus, id] });
  } else {
    await sequelize.query("UPDATE orders SET status = ? WHERE id = ?", { replacements: [status, id] });
  }
};

const updateOrderPaymentStatus = async (id, paymentStatus) => {
  await sequelize.query("UPDATE orders SET payment_status = ? WHERE id = ?", { replacements: [paymentStatus, id] });
};

module.exports = { findAllUsers, findUserById, updateUserStatus, findAllOrders, findOrderById, updateOrderStatus, updateOrderPaymentStatus };