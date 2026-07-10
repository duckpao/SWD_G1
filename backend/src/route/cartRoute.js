const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeFromCart);
router.post("/apply-voucher", cartController.applyVoucher);

module.exports = router;