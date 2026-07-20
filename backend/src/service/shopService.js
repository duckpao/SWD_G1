const shopRepository = require("../repository/shopRepository");
const orderRepository = require("../repository/orderRepository");

const getMyShop = async (ownerId) => {
  const shop = await shopRepository.findByOwnerId(ownerId);
  if (!shop) throw new Error("B?n chua c� c?a h�ng!");
  return shop;
};
const getProducts = async (ownerId) => {
  return await shopRepository.findByShopId((await getMyShop(ownerId)).id);
};
const addProduct = async (ownerId, data) => {
  const shop = await getMyShop(ownerId);
  if (!data.name || !data.base_price) throw new Error("Thi?u t�n s?n ph?m ho?c gi�!");
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
  if (!shipperId) throw new Error("Chua ch?n shipper!");
  const order = await orderRepository.findById(orderId, null);
  if (!order || order.shop_id !== shop.id) throw new Error("�on h�ng kh�ng thu?c c?a h�ng c?a b?n!");
  if (order.status !== "confirmed") throw new Error("�on h�ng chua du?c x�c nh?n!");
  await shopRepository.assignShipper(orderId, shipperId, shop.id);
  await orderRepository.createStatusHistory(orderId, "confirmed", "shipping", ownerId, "Giao cho shipper #" + shipperId);
};
const cancelOrder = async (ownerId, orderId, reason) => {
  const shop = await getMyShop(ownerId);
  const order = await orderRepository.findById(orderId, null);
  if (!order || order.shop_id !== shop.id) throw new Error("�on h�ng kh�ng thu?c c?a h�ng c?a b?n!");
  if (order.status !== "pending" && order.status !== "confirmed" && order.status !== "shipping") throw new Error("Kh�ng th? h?y don h�ng n�y!");
  await orderRepository.updateStatus(orderId, "cancelled", "cancelled_at");
  await orderRepository.createStatusHistory(orderId, order.status, "cancelled", ownerId, reason || "Shop h?y");
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

const getReviews = async (ownerId) => {
  return await shopRepository.getReviewsByShop((await getMyShop(ownerId)).id);
};

module.exports = { getMyShop, getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, cancelOrder, getShippers, getInventory, getSales, getReviews };
