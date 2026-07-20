const { generateVietQRUrl, BANK_CONFIG } = require("../config/vnpay");
const paymentRepository = require("../repository/paymentRepository");
const orderRepository = require("../repository/orderRepository");

const createQrPayment = async (userId, orderId) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.payment_status === "paid") throw new Error("Đơn hàng đã được thanh toán!");
  const content = "THANHTOAN DON " + orderId + " USER " + userId;
  return {
    orderId: order.id, amount: order.final_amount,
    qrUrl: generateVietQRUrl(Math.round(parseFloat(order.final_amount)), content),
    bankInfo: {
      bank: BANK_CONFIG.bankName, accountNumber: BANK_CONFIG.accountNumber,
      accountName: BANK_CONFIG.accountName, content: content,
    },
  };
};

const confirmPayment = async (userId, orderId) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.payment_status === "paid") throw new Error("Đơn hàng đã được thanh toán!");
  if (order.user_id != userId) throw new Error("Không có quyền thanh toán đơn này!");

  const txnCode = "TXN" + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  await paymentRepository.createTransaction({
    order_id: orderId, transaction_code: txnCode,
    payment_method: "VietQR", amount: order.final_amount,
    status: "success", paid_at: new Date(),
  });

  await orderRepository.updatePaymentStatus(orderId, "paid");
  await orderRepository.createStatusHistory(orderId, order.status, order.status, userId, "Thanh toán VietQR thành công - Mã GD: " + txnCode);
  return { message: "Thanh toán thành công!", transactionCode: txnCode, orderId: orderId };
};

module.exports = { createQrPayment, confirmPayment };