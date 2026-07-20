const express = require("express");
const router = express.Router();
const shipperController = require("../controller/shipperController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("shipper"));

router.get("/deliveries", shipperController.getDeliveries);
router.put("/deliveries/:id/pickup", shipperController.pickup);
router.put("/deliveries/:id/deliver", shipperController.deliver);

module.exports = router;