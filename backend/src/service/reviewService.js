const reviewRepository = require("../repository/reviewRepository");
const orderRepository = require("../repository/orderRepository");

const submitReview = async (userId, { productId, orderId, variantId, rating, title, comment }) => {
  if (!rating || rating < 1 || rating > 5) throw new Error("Đánh giá phải từ 1 đến 5 sao!");
  const order = await orderRepository.findById(orderId, userId);
  if (!order) throw new Error("Đơn hàng không tồn tại!");
  if (order.status !== "delivered") throw new Error("Chỉ có thể đánh giá sản phẩm đã nhận hàng!");

  const existing = await reviewRepository.findByUserAndProduct(userId, orderId, productId);
  if (existing) throw new Error("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi!");

  await reviewRepository.create({
    product_id: productId,
    user_id: userId,
    order_id: orderId,
    variant_id: variantId || null,
    rating,
    title: title || null,
    comment: comment || null,
  });

  await reviewRepository.updateProductRating(productId);
};

const getProductReviews = async (productId) => {
  return await reviewRepository.findByProduct(productId);
};

module.exports = { submitReview, getProductReviews };