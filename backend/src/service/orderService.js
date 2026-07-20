const orderRepository = require("../repository/orderRepository");
const cartRepository = require("../repository/cartRepository");
const productRepository = require("../repository/productRepository");
const voucherRepository = require("../repository/voucherRepository");

const createOrder = async (userId, { shippingAddress, phone, recipientName, paymentMethod, note, voucherCode, items }) => {
  if (!shippingAddress || !phone || !recipientName) throw new Error("Vui lòng điền đầy đủ thông tin giao hàng!");
  if (!paymentMethod) throw new Error("Vui lòng chọn phương thức thanh toán!");

  let cartItems;
  if (items && items.length > 0) { cartItems = items; }
  else {
    const cart = await cartRepository.findByUser(userId);
    if (!cart.length) throw new Error("Giỏ hàng trống!");
    cartItems = cart;
  }

  let subtotal = 0, shopId = null;
  const orderItems = [];

  for (const item of cartItems) {
    const product = await productRepository.findById(item.product_id);
    if (!product) throw new Error("Sản phẩm không tồn tại!");
    if (!product.is_available) throw new Error("Sản phẩm " + product.name + " đã ngừng bán!");
    if (product.stock_quantity < item.quantity) throw new Error("Sản phẩm " + product.name + " không đủ hàng!");

    const price = item.variant_price || item.base_price || product.base_price;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    if (!shopId) shopId = product.shop_id;

    orderItems.push({
      product_id: product.id, variant_id: item.variant_id || null,
      product_name: product.name, variant_name: item.variant_name || null,
      quantity: item.quantity, unit_price: price, subtotal: lineTotal,
    });
  }

  const shippingFee = subtotal >= 200000 ? 0 : 15000;
  let discountAmount = 0, voucherId = null;

  if (voucherCode) {
    const voucher = await voucherRepository.findByCode(voucherCode);
    if (!voucher) throw new Error("Mã giảm giá không hợp lệ!");
    if (subtotal < voucher.min_order_amount) throw new Error("Đơn hàng chưa đạt giá trị tối thiểu!");
    discountAmount = voucher.type === "percentage"
      ? Math.min(Math.round(subtotal * voucher.value / 100), voucher.max_discount || Infinity)
      : voucher.value;
    voucherId = voucher.id;
  }

  const finalAmount = subtotal - discountAmount + shippingFee;
  const isPaid = paymentMethod !== "COD";

  const orderId = await orderRepository.create({
    user_id: userId, shop_id: shopId,
    total_amount: subtotal, discount_amount: discountAmount, shipping_fee: shippingFee,
    final_amount: finalAmount, payment_method: paymentMethod,
    payment_status: isPaid ? "paid" : "pending",
    shipping_address: shippingAddress, phone: phone, recipient_name: recipientName,
    status: "confirmed", note: note || null,
  });

  for (const item of orderItems) {
    await orderRepository.createOrderItem({ ...item, order_id: orderId });
    await productRepository.updateStock(item.product_id, item.quantity);
  }

  await orderRepository.createStatusHistory(orderId, null, "confirmed", userId, "Đặt hàng thành công");

  if (voucherId) await voucherRepository.incrementUsed(voucherId);
  await cartRepository.clearCart(userId);
  return orderId;
};

const getOrderHistory = async (userId, page = 1, limit = 10) => {
  return await orderRepository.findByUser(userId, page, limit);
};

const getOrderDetail = async (orderId, userId) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  const items = await orderRepository.findItemsByOrderId(orderId);
  return { ...order, items };
};

const cancelOrder = async (orderId, userId, reason) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.status !== "confirmed" && order.status !== "pending" && order.status !== "shipping") throw new Error("Không thể hủy đơn hàng ở trạng thái " + order.status + "!");
  await orderRepository.updateStatus(orderId, "cancelled", "cancelled_at");
  await orderRepository.createStatusHistory(orderId, order.status, "cancelled", userId, reason || "Khách hủy");
};

const confirmDelivery = async (orderId, userId) => {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.status !== "shipping") throw new Error("Đơn hàng chưa được giao!");
  await orderRepository.updateStatus(orderId, "delivered", "delivered_at");
  await orderRepository.createStatusHistory(orderId, "shipping", "delivered", userId, "Khách xác nhận đã nhận hàng");
};

module.exports = { createOrder, getOrderHistory, getOrderDetail, cancelOrder, confirmDelivery };