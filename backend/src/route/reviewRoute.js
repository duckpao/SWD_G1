const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", protect, reviewController.submitReview);

module.exports = router;