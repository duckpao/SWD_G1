const orderService = require("../service/orderService");
const paymentService = require("../service/paymentService");

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, recipientName, paymentMethod, note, voucherCode, items } = req.body;
    const orderId = await orderService.createOrder(req.user.id, { shippingAddress, phone, recipientName, paymentMethod, note, voucherCode, items });

    if (paymentMethod !== "COD") {
      await paymentService.processPayment(req.user.id, orderId, paymentMethod);
    }

    const order = await orderService.getOrderDetail(orderId, req.user.id);
    return res.status(201).json(order);
  } catch (error) {
    console.error("Lỗi createOrder:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const orders = await orderService.getOrderHistory(req.user.id, page || 1, limit || 10);
    return res.json(orders);
  } catch (error) {
    console.error("Lỗi getOrderHistory:", error.message);
    return res.status(500).json({ message: "Lỗi lấy lịch sử đơn hàng" });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await orderService.getOrderDetail(req.params.id, req.user.id);
    return res.json(order);
  } catch (error) {
    console.error("Lỗi getOrderDetail:", error.message);
    return res.status(error.message.includes("không tồn tại") ? 404 : 500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    await orderService.cancelOrder(req.params.id, req.user.id, reason);
    return res.json({ message: "Hủy đơn hàng thành công!" });
  } catch (error) {
    console.error("Lỗi cancelOrder:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    await orderService.confirmDelivery(req.params.id, req.user.id);
    return res.json({ message: "Xác nhận đã nhận hàng thành công!" });
  } catch (error) {
    console.error("Lỗi confirmDelivery:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrderHistory, getOrderDetail, cancelOrder, confirmDelivery };