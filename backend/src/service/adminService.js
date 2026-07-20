const adminRepository = require("../repository/adminRepository");
const orderRepository = require("../repository/orderRepository");

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

const updateOrderStatus = async (orderId, status, paymentStatus) => {
  const order = await adminRepository.findOrderById(orderId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");

  const updates = { status };
  if (paymentStatus) updates.payment_status = paymentStatus;

  if (status === "confirmed" || paymentStatus === "paid") {
    await orderRepository.updateStatus(orderId, "confirmed", "confirmed_at");
    await orderRepository.createStatusHistory(orderId, order.status, "confirmed", null, "Admin xác nhận đơn hàng");
  }
  if (status === "cancelled") {
    await orderRepository.updateStatus(orderId, "cancelled", "cancelled_at");
    await orderRepository.createStatusHistory(orderId, order.status, "cancelled", null, "Admin hủy đơn hàng");
  }
  if (status === "shipping") {
    await orderRepository.updateStatus(orderId, "shipping", "shipped_at");
    await orderRepository.createStatusHistory(orderId, order.status, "shipping", null, "Đơn hàng đang được giao");
  }
  if (status === "delivered") {
    await orderRepository.updateStatus(orderId, "delivered", "delivered_at");
    await orderRepository.createStatusHistory(orderId, order.status, "delivered", null, "Giao hàng thành công");
  }

  if (paymentStatus === "paid") {
    await orderRepository.updatePaymentStatus(orderId, "paid");
  }

  return await adminRepository.findOrderById(orderId);
};

module.exports = { getUsers, toggleUserStatus, getOrders, updateOrderStatus };