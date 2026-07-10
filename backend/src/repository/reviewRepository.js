const { sequelize } = require("../config/db");

const findByProduct = async (productId) => {
  const [rows] = await sequelize.query("SELECT r.*, u.fullname as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC", { replacements: [productId] });
  return rows;
};

const create = async (data) => {
  await sequelize.query("INSERT INTO reviews (product_id, user_id, order_id, variant_id, rating, title, comment, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", { replacements: [data.product_id, data.user_id, data.order_id, data.variant_id, data.rating, data.title || null, data.comment || null, data.images || null] });
};

const findByUserAndProduct = async (userId, orderId, productId) => {
  const [rows] = await sequelize.query("SELECT * FROM reviews WHERE user_id = ? AND order_id = ? AND product_id = ?", { replacements: [userId, orderId, productId] });
  return rows[0] || null;
};

const updateProductRating = async (productId) => {
  const [rows] = await sequelize.query("SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1", { replacements: [productId] });
  await sequelize.query("UPDATE products SET avg_rating = ?, total_reviews = ? WHERE id = ?", { replacements: [parseFloat(rows[0].avg_rating) || 0, parseInt(rows[0].total), productId] });
};

module.exports = { findByProduct, create, findByUserAndProduct, updateProductRating };