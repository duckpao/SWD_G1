const shopRepository = require("../repository/shopRepository");
const orderRepository = require("../repository/orderRepository");

const getMyShop = async (ownerId) => {
  const shop = await shopRepository.findByOwnerId(ownerId);
  if (!shop) throw new Error("Bạn chưa có cửa hàng!");
  return shop;
};
const getProducts = async (ownerId) => {
  return await shopRepository.findByShopId((await getMyShop(ownerId)).id);
};
const addProduct = async (ownerId, data) => {
  const shop = await getMyShop(ownerId);
  if (!data.name || !data.base_price) throw new Error("Thiếu tên sản phẩm hoặc giá!");
  return await shopRepository.createProduct({ ...data, shop_id: shop.id });
};
const editProduct = async (ownerId, productId, data) => {
  await shopRepository.updateProduct(productId, (await getMyShop(ownerId)).id, data);
};
const removeProduct = async (ownerId, productId) => {
  await shopRepository.deleteProduct(productId, (await getMyShop(ownerId)).id);
};
const getOrders = async (ownerId) => {
  return await shopRepository.findOrdersByShop((await getMyShop(ownerId)).id);
};
const assignShipper = async (ownerId, orderId, shipperId) => {
  const shop = await getMyShop(ownerId);
  if (!shipperId) throw new Error("Chưa chọn shipper!");
  const order = await orderRepository.findById(orderId, null);
  if (!order || order.shop_id !== shop.id) throw new Error("Đơn hàng không thuộc cửa hàng của bạn!");
  if (order.status !== "confirmed") throw new Error("Đơn hàng chưa được xác nhận!");
  await shopRepository.assignShipper(orderId, shipperId, shop.id);
  await orderRepository.createStatusHistory(orderId, "confirmed", "shipping", ownerId, "Giao cho shipper #" + shipperId);
};
const cancelOrder = async (ownerId, orderId, reason) => {
  const shop = await getMyShop(ownerId);
  const order = await orderRepository.findById(orderId, null);
  if (!order || order.shop_id !== shop.id) throw new Error("Đơn hàng không thuộc cửa hàng của bạn!");
  if (order.status !== "confirmed" && order.status !== "shipping") throw new Error("Không thể hủy đơn hàng này!");
  await orderRepository.updateStatus(orderId, "cancelled", "cancelled_at");
  await orderRepository.createStatusHistory(orderId, order.status, "cancelled", ownerId, reason || "Shop hủy");
};
const getShippers = async () => {
  return await shopRepository.listShippers();
};
const getInventory = async (ownerId) => {
  return await shopRepository.getInventory((await getMyShop(ownerId)).id);
};
const getSales = async (ownerId) => {
  return await shopRepository.getSalesData((await getMyShop(ownerId)).id);
};

module.exports = { getMyShop, getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, cancelOrder, getShippers, getInventory, getSales };