const paymentRepository = require("../repository/paymentRepository");
const orderRepository = require("../repository/orderRepository");

const processPayment = async (userId, orderId, paymentMethod) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.payment_status === "paid") throw new Error("Đơn hàng đã được thanh toán!");

  const txnCode = "TXN" + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  await paymentRepository.createTransaction({
    order_id: orderId,
    transaction_code: txnCode,
    payment_method: paymentMethod,
    amount: order.final_amount,
    status: "success",
    paid_at: new Date(),
  });

  await orderRepository.updatePaymentStatus(orderId, "paid");
  await orderRepository.updateStatus(orderId, "confirmed", "confirmed_at");
  await orderRepository.createStatusHistory(orderId, order.status, "confirmed", userId, "Thanh toán thành công");

  return { transactionCode: txnCode, amount: order.final_amount };
};

module.exports = { processPayment };