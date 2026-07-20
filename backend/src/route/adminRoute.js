const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.get("/users", adminController.getUsers);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);
router.get("/orders", adminController.getOrders);
router.put("/orders/:id/status", adminController.updateOrderStatus);

module.exports = router;