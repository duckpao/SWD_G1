const { sequelize } = require("../config/db");

const findDeliveriesByShipper = async (shipperId) => {
  const [rows] = await sequelize.query("SELECT d.*, o.user_id, o.final_amount, o.shipping_address, o.phone, o.recipient_name, o.status as order_status, o.payment_method, o.payment_status, u.fullname as customer_name FROM deliveries d JOIN orders o ON d.order_id = o.id JOIN users u ON o.user_id = u.id WHERE d.shipper_id = ? ORDER BY d.assigned_at DESC", { replacements: [shipperId] });
  return rows;
};

const updateDeliveryStatus = async (deliveryId, shipperId, status) => {
  const field = status === "picked_up" ? "picked_up_at" : status === "delivered" ? "delivered_at" : null;
  if (field) {
    await sequelize.query("UPDATE deliveries SET shipping_status = ?, " + field + " = NOW() WHERE id = ? AND shipper_id = ?", { replacements: [status, deliveryId, shipperId] });
  } else {
    await sequelize.query("UPDATE deliveries SET shipping_status = ? WHERE id = ? AND shipper_id = ?", { replacements: [status, deliveryId, shipperId] });
  }
};

const updateOrderStatusFromDelivery = async (orderId, status) => {
  const orderStatus = status === "delivered" ? "delivered" : "shipping";
  await sequelize.query("UPDATE orders SET status = ? WHERE id = ?", { replacements: [orderStatus, orderId] });
};

const findDeliveryByOrderId = async (orderId) => {
  const [rows] = await sequelize.query("SELECT * FROM deliveries WHERE order_id = ?", { replacements: [orderId] });
  return rows[0] || null;
};

module.exports = { findDeliveriesByShipper, updateDeliveryStatus, updateOrderStatusFromDelivery, findDeliveryByOrderId };