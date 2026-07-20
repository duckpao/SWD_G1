const express = require("express");
const router = express.Router();
const ctrl = require("../controller/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.get("/users", ctrl.getUsers);
router.put("/users/:id/toggle-status", ctrl.toggleUserStatus);
router.get("/orders", ctrl.getOrders);
router.put("/orders/:id/status", ctrl.updateOrderStatus);
router.get("/shippers", ctrl.getShippers);
router.get("/shippers/:id/deliveries", ctrl.getShipperDeliveries);
router.put("/orders/:id/assign-shipper", ctrl.assignShipper);

module.exports = router;