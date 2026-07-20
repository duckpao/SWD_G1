const express = require("express");
const router = express.Router();
const ctrl = require("../controller/shopController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("shopowner"));

router.get("/products", ctrl.getProducts);
router.post("/products", ctrl.addProduct);
router.put("/products/:id", ctrl.editProduct);
router.delete("/products/:id", ctrl.removeProduct);
router.get("/orders", ctrl.getOrders);
router.put("/orders/:id/assign-shipper", ctrl.assignShipper);
router.put("/orders/:id/cancel", ctrl.cancelOrder);
router.get("/shippers", ctrl.getShippers);
router.get("/inventory", ctrl.getInventory);
router.get("/sales", ctrl.getSales);

module.exports = router;