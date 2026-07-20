const adminRepository = require("../repository/adminRepository");
const orderRepository = require("../repository/orderRepository");
const deliveryRepository = require("../repository/deliveryRepository");
const { sequelize } = require("../config/db");

const getUsers = async (role) => {
  return await adminRepository.findAllUsers(role || null);
};

const toggleUserStatus = async (userId) => {
  const user = await adminRepository.findUserById(userId);
  if (!user) throw new Error("Người dùng không tồn tại!");
  const newStatus = user.status === "active" ? "suspended" : "active";
  await adminRepository.updateUserStatus(userId, newStatus);
  return { id: userId, status: newStatus };
};

const getOrders = async () => {
  return await adminRepository.findAllOrders();
};

const getShippers = async () => {
  const [rows] = await sequelize.query(`
    SELECT u.id, u.fullname, u.email, u.phone, u.status,
      COUNT(CASE WHEN d.shipping_status IN ('assigned','picked_up','in_transit') THEN 1 END) as active_deliveries
    FROM users u
    LEFT JOIN deliveries d ON u.id = d.shipper_id
    WHERE u.role = 'shipper'
    GROUP BY u.id
    ORDER BY active_deliveries ASC
  `);
  return rows;
};

const getShipperDeliveries = async (shipperId) => {
  const [rows] = await sequelize.query(`
    SELECT d.*, o.id as order_id, o.final_amount, o.shipping_address, o.recipient_name, o.phone,
      u.fullname as customer_name
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    JOIN users u ON o.user_id = u.id
    WHERE d.shipper_id = ?
    ORDER BY d.assigned_at DESC
  `, { replacements: [shipperId] });
  return rows;
};

const assignShipper = async (orderId, shipperId) => {
  const order = await adminRepository.findOrderById(orderId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.status !== "confirmed") throw new Error("Đơn hàng chưa được xác nhận!");

  // Check shipper exists
  const [shippers] = await sequelize.query("SELECT id, fullname FROM users WHERE id = ? AND role = 'shipper'", { replacements: [shipperId] });
  if (!shippers.length) throw new Error("Shipper không tồn tại!");

  // Create delivery + update order
  await deliveryRepository.createDelivery(orderId, shipperId);
  await orderRepository.updateStatus(orderId, "shipping", null);
  await orderRepository.createStatusHistory(orderId, "confirmed", "shipping", shipperId, "Giao cho shipper " + shippers[0].fullname);

  return { message: "Đã gán shipper cho đơn hàng!", shipper: shippers[0] };
};

const updateOrderStatus = async (orderId, status, paymentStatus) => {
  const order = await adminRepository.findOrderById(orderId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");

  if (status === "cancelled") {
    await orderRepository.updateStatus(orderId, "cancelled", "cancelled_at");
    await orderRepository.createStatusHistory(orderId, order.status, "cancelled", null, "Admin hủy đơn hàng");
  }

  if (paymentStatus === "paid") {
    await orderRepository.updatePaymentStatus(orderId, "paid");
  }

  return await adminRepository.findOrderById(orderId);
};

module.exports = { getUsers, toggleUserStatus, getOrders, getShippers, getShipperDeliveries, assignShipper, updateOrderStatus };