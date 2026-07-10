const cartRepository = require("../repository/cartRepository");
const productRepository = require("../repository/productRepository");
const voucherRepository = require("../repository/voucherRepository");

const getCart = async (userId) => {
  const items = await cartRepository.findByUser(userId);
  let subtotal = 0;
  for (const item of items) {
    const price = item.variant_price || item.base_price;
    item.total_price = price * item.quantity;
    subtotal += item.total_price;
  }
  return { items, subtotal };
};

const addToCart = async (userId, productId, variantId, quantity) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error("Sản phẩm không tồn tại!");
  if (!product.is_available) throw new Error("Sản phẩm đã ngừng bán!");
  if (quantity < 1) throw new Error("Số lượng không hợp lệ!");
  const item = await cartRepository.addItem(userId, productId, variantId || null, quantity);
  return item;
};

const updateCartItem = async (id, userId, quantity) => {
  if (quantity < 1) throw new Error("Số lượng phải lớn hơn 0!");
  await cartRepository.updateQuantity(id, userId, quantity);
};

const removeFromCart = async (id, userId) => {
  await cartRepository.removeItem(id, userId);
};

const applyVoucher = async (code, subtotal) => {
  const voucher = await voucherRepository.findByCode(code);
  if (!voucher) throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
  let discount = 0;
  if (subtotal < voucher.min_order_amount) throw new Error("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.min_order_amount + "đ để áp dụng mã này!");
  if (voucher.type === "percentage") {
    discount = Math.round(subtotal * voucher.value / 100);
    if (voucher.max_discount && discount > voucher.max_discount) discount = voucher.max_discount;
  } else {
    discount = voucher.value;
  }
  return { voucher, discount };
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, applyVoucher };