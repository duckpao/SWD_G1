const shopRepository = require("../repository/shopRepository");
const orderRepository = require("../repository/orderRepository");

const getMyShop = async (ownerId) => {
  const shop = await shopRepository.findByOwnerId(ownerId);
  if (!shop) throw new Error("Bạn chưa có cửa hàng!");
  return shop;
};

const getProducts = async (ownerId) => {
  const shop = await getMyShop(ownerId);
  return await shopRepository.findByShopId(shop.id);
};

const addProduct = async (ownerId, data) => {
  const shop = await getMyShop(ownerId);
  if (!data.name || !data.base_price) throw new Error("Thiếu tên sản phẩm hoặc giá!");
  return await shopRepository.createProduct({ ...data, shop_id: shop.id });
};

const editProduct = async (ownerId, productId, data) => {
  const shop = await getMyShop(ownerId);
  await shopRepository.updateProduct(productId, shop.id, data);
};

const removeProduct = async (ownerId, productId) => {
  const shop = await getMyShop(ownerId);
  await shopRepository.deleteProduct(productId, shop.id);
};

const getOrders = async (ownerId) => {
  const shop = await getMyShop(ownerId);
  return await shopRepository.findOrdersByShop(shop.id);
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

const getShippers = async () => {
  return await shopRepository.listShippers();
};

const getInventory = async (ownerId) => {
  const shop = await getMyShop(ownerId);
  return await shopRepository.getInventory(shop.id);
};

const getSales = async (ownerId) => {
  const shop = await getMyShop(ownerId);
  return await shopRepository.getSalesData(shop.id);
};

module.exports = { getMyShop, getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, getShippers, getInventory, getSales };