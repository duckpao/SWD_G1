const { sequelize } = require("../config/db");

// Auto-assign the shipper with fewest active deliveries
const findAvailableShipper = async () => {
  const [rows] = await sequelize.query(`
    SELECT u.id, u.fullname, u.phone, COUNT(d.id) as active_deliveries
    FROM users u
    LEFT JOIN deliveries d ON d.shipper_id = u.id AND d.shipping_status IN ('assigned','picked_up','in_transit')
    WHERE u.role = 'shipper' AND u.status = 'active'
    GROUP BY u.id
    ORDER BY active_deliveries ASC
    LIMIT 1
  `);
  return rows[0] || null;
};

const createDelivery = async (orderId, shipperId) => {
  // Get order + shop info
  const [orders] = await sequelize.query("SELECT * FROM orders WHERE id = ?", { replacements: [orderId] });
  const order = orders[0];
  if (!order) throw new Error("Đơn hàng không tồn tại!");

  const [shops] = await sequelize.query("SELECT * FROM shops WHERE id = ?", { replacements: [order.shop_id] });
  const shop = shops[0];
  if (!shop) throw new Error("Cửa hàng không tồn tại!");

  const pickAddr = [shop.address, shop.district, shop.city].filter(Boolean).join(", ");
  const delAddr = order.shipping_address;

  // Check if delivery already exists
  const [existing] = await sequelize.query("SELECT id FROM deliveries WHERE order_id = ?", { replacements: [orderId] });
  if (existing.length > 0) return existing[0];

  await sequelize.query(
    "INSERT INTO deliveries (order_id, shipper_id, pickup_address, delivery_address, recipient_name, recipient_phone, shipping_status, assigned_at) VALUES (?, ?, ?, ?, ?, ?, 'assigned', NOW())",
    { replacements: [orderId, shipperId, pickAddr || "Cửa hàng", delAddr, order.recipient_name, order.phone] }
  );
};

const updateOrderAndAssignShipper = async (orderId) => {
  const shipper = await findAvailableShipper();
  if (!shipper) throw new Error("Không có shipper nào khả dụng!");

  await sequelize.query("UPDATE orders SET status = 'shipping' WHERE id = ?", { replacements: [orderId] });
  await createDelivery(orderId, shipper.id);

  // Status history
  await sequelize.query(
    "INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note) VALUES (?, 'confirmed', 'shipping', ?, ?)",
    { replacements: [orderId, shipper.id, "Tự động gán cho shipper " + shipper.fullname] }
  );

  return shipper;
};

module.exports = { findAvailableShipper, createDelivery, updateOrderAndAssignShipper };