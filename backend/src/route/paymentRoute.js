const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/qr/:orderId", paymentController.createQrPayment);
router.post("/confirm/:orderId", paymentController.confirmPayment);

module.exports = router;