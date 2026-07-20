const shipperRepository = require("../repository/shipperRepository");
const orderRepository = require("../repository/orderRepository");

const getMyDeliveries = async (shipperId) => {
  return await shipperRepository.findDeliveriesByShipper(shipperId);
};

const markPickedUp = async (shipperId, deliveryId) => {
  const deliveries = await shipperRepository.findDeliveriesByShipper(shipperId);
  const delivery = deliveries.find(d => d.id == deliveryId);
  if (!delivery) throw new Error("Không tìm thấy đơn giao hàng!");
  if (delivery.shipping_status !== "assigned") throw new Error("Đơn đã được cập nhật trước đó!");
  await shipperRepository.updateDeliveryStatus(deliveryId, shipperId, "picked_up");
  await shipperRepository.updateOrderStatusFromDelivery(delivery.order_id, "picked_up");
  await orderRepository.createStatusHistory(delivery.order_id, "assigned", "shipping", shipperId, "Shipper đã lấy hàng");
};

const markDelivered = async (shipperId, deliveryId) => {
  const deliveries = await shipperRepository.findDeliveriesByShipper(shipperId);
  const delivery = deliveries.find(d => d.id == deliveryId);
  if (!delivery) throw new Error("Không tìm thấy đơn giao hàng!");
  if (delivery.shipping_status !== "picked_up" && delivery.shipping_status !== "in_transit") throw new Error("Đơn chưa được lấy hàng!");
  await shipperRepository.updateDeliveryStatus(deliveryId, shipperId, "delivered");
  await shipperRepository.updateOrderStatusFromDelivery(delivery.order_id, "delivered");
  await orderRepository.createStatusHistory(delivery.order_id, "shipping", "delivered", shipperId, "Shipper giao hàng thành công");
  await orderRepository.updateStatus(delivery.order_id, "delivered", "delivered_at");
};

module.exports = { getMyDeliveries, markPickedUp, markDelivered };