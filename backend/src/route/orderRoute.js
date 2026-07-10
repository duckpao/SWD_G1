const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", orderController.createOrder);
router.get("/", orderController.getOrderHistory);
router.get("/:id", orderController.getOrderDetail);
router.put("/:id/cancel", orderController.cancelOrder);
router.put("/:id/confirm-delivery", orderController.confirmDelivery);

module.exports = router;