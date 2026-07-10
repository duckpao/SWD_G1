const reviewService = require("../service/reviewService");

const submitReview = async (req, res) => {
  try {
    const { productId, orderId, variantId, rating, title, comment } = req.body;
    await reviewService.submitReview(req.user.id, { productId, orderId, variantId, rating, title, comment });
    return res.status(201).json({ message: "Đánh giá thành công!" });
  } catch (error) {
    console.error("Lỗi submitReview:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getProductReviews(req.params.productId);
    return res.json(reviews);
  } catch (error) {
    console.error("Lỗi getProductReviews:", error.message);
    return res.status(500).json({ message: "Lỗi lấy đánh giá" });
  }
};

module.exports = { submitReview, getProductReviews };