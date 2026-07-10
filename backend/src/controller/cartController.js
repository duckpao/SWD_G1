const cartService = require("../service/cartService");

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return res.json(cart);
  } catch (error) {
    console.error("Lỗi getCart:", error.message);
    return res.status(500).json({ message: "Lỗi lấy giỏ hàng" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: "Thiếu thông tin sản phẩm!" });
    const item = await cartService.addToCart(req.user.id, productId, variantId, quantity || 1);
    return res.status(201).json(item);
  } catch (error) {
    console.error("Lỗi addToCart:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    await cartService.updateCartItem(req.params.id, req.user.id, quantity);
    return res.json({ message: "Cập nhật số lượng thành công!" });
  } catch (error) {
    console.error("Lỗi updateCartItem:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await cartService.removeFromCart(req.params.id, req.user.id);
    return res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng!" });
  } catch (error) {
    console.error("Lỗi removeFromCart:", error.message);
    return res.status(500).json({ message: "Lỗi xóa sản phẩm" });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: "Thiếu mã giảm giá!" });
    const result = await cartService.applyVoucher(code, subtotal || 0);
    return res.json(result);
  } catch (error) {
    console.error("Lỗi applyVoucher:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, applyVoucher };