const { sequelize } = require("../config/db");

// ===== SHOP =====
const findByOwnerId = async (ownerId) => {
  const [rows] = await sequelize.query("SELECT * FROM shops WHERE owner_id = ?", { replacements: [ownerId] });
  return rows[0] || null;
};

// ===== PRODUCTS =====
const findByShopId = async (shopId) => {
  const [rows] = await sequelize.query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.shop_id = ? ORDER BY p.created_at DESC", { replacements: [shopId] });
  return rows;
};

const createProduct = async (data) => {
  const [result] = await sequelize.query("INSERT INTO products (shop_id, category_id, name, description, base_price, stock_quantity, image_url, origin, unit, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", { replacements: [data.shop_id, data.category_id, data.name, data.description, data.base_price, data.stock_quantity, data.image_url, data.origin, data.unit || "kg", data.is_available !== false ? 1 : 0] });
  return result[0] || result;
};

const updateProduct = async (id, shopId, data) => {
  const sets = []; const vals = [];
  ["name","description","base_price","stock_quantity","image_url","origin","unit","category_id","is_available"].forEach(k => {
    if (data[k] !== undefined) { sets.push(k + " = ?"); vals.push(data[k]); }
  });
  if (!sets.length) return;
  vals.push(id, shopId);
  await sequelize.query("UPDATE products SET " + sets.join(", ") + " WHERE id = ? AND shop_id = ?", { replacements: vals });
};

const deleteProduct = async (id, shopId) => {
  await sequelize.query("DELETE FROM products WHERE id = ? AND shop_id = ?", { replacements: [id, shopId] });
};

// ===== ORDERS =====
const findOrdersByShop = async (shopId) => {
  const [rows] = await sequelize.query("SELECT o.*, u.fullname as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.shop_id = ? ORDER BY o.created_at DESC", { replacements: [shopId] });
  return rows;
};

const assignShipper = async (orderId, shipperId, shopId) => {
  // Update order
  await sequelize.query("UPDATE orders SET status = ? WHERE id = ? AND shop_id = ?", { replacements: ["shipping", orderId, shopId] });
  // Get order info for delivery
  const [orders] = await sequelize.query("SELECT * FROM orders WHERE id = ?", { replacements: [orderId] });
  const order = orders[0];
  if (!order) return;
  // Get shop pickup address
  const [shops] = await sequelize.query("SELECT address, city, district FROM shops WHERE id = ?", { replacements: [shopId] });
  const shop = shops[0];
  // Create delivery record
  const pickAddr = [shop?.address, shop?.district, shop?.city].filter(Boolean).join(", ") || "Địa chỉ shop";
  await sequelize.query("INSERT INTO deliveries (order_id, shipper_id, pickup_address, delivery_address, recipient_name, recipient_phone, shipping_status, assigned_at) VALUES (?, ?, ?, ?, ?, ?, 'assigned', NOW())", {
    replacements: [orderId, shipperId, pickAddr, order.shipping_address, order.recipient_name, order.phone]
  });
};

// ===== SHIPPERS =====
const listShippers = async () => {
  const [rows] = await sequelize.query("SELECT id, fullname, email, phone FROM users WHERE role = ? AND status = ?", { replacements: ["shipper", "active"] });
  return rows;
};

// ===== INVENTORY =====
const getInventory = async (shopId) => {
  const [rows] = await sequelize.query("SELECT id, name, stock_quantity, unit, base_price, is_available FROM products WHERE shop_id = ? ORDER BY name", { replacements: [shopId] });
  return rows;
};

// ===== SALES =====
const getSalesData = async (shopId) => {
  const [rows] = await sequelize.query("SELECT DATE(order_date) as date, COUNT(*) as orders, SUM(final_amount) as revenue, SUM(total_products_sold) as items FROM daily_reports WHERE shop_id = ? AND report_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(order_date) ORDER BY date", { replacements: [shopId] });
  return rows;
};

module.exports = { findByOwnerId, findByShopId, createProduct, updateProduct, deleteProduct, findOrdersByShop, assignShipper, listShippers, getInventory, getSalesData };