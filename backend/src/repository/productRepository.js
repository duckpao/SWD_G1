const { sequelize } = require("../config/db");

const findAll = async ({ search, categoryId, minPrice, maxPrice, sortBy, sortOrder, page, limit }) => {
  let sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_available = 1";
  const replacements = [];
  if (search) { sql += " AND p.name LIKE ?"; replacements.push("%" + search + "%"); }
  if (categoryId) { sql += " AND p.category_id = ?"; replacements.push(categoryId); }
  if (minPrice) { sql += " AND p.base_price >= ?"; replacements.push(minPrice); }
  if (maxPrice) { sql += " AND p.base_price <= ?"; replacements.push(maxPrice); }
  const allowedSort = { price: "p.base_price", popularity: "p.total_sold", rating: "p.avg_rating", newest: "p.created_at" };
  const col = allowedSort[sortBy] || "p.created_at";
  const dir = sortOrder === "asc" ? "ASC" : "DESC";
  sql += " ORDER BY " + col + " " + dir;
  if (page && limit) { sql += " LIMIT ? OFFSET ?"; replacements.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit)); }
  const [rows] = await sequelize.query(sql, { replacements });
  return rows;
};

const findById = async (id) => {
  const [rows] = await sequelize.query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?", { replacements: [id] });
  return rows[0] || null;
};

const findVariantsByProductId = async (productId) => {
  const [rows] = await sequelize.query("SELECT * FROM product_variants WHERE product_id = ? AND is_available = 1", { replacements: [productId] });
  return rows;
};

const findCategories = async () => {
  const [rows] = await sequelize.query("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order");
  return rows;
};

const updateStock = async (id, quantity) => {
  await sequelize.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?", { replacements: [quantity, id, quantity] });
};

module.exports = { findAll, findById, findVariantsByProductId, findCategories, updateStock };