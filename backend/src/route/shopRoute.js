const express = require("express");
const router = express.Router();
const shopController = require("../controller/shopController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("shopowner"));

router.get("/products", shopController.getProducts);
router.post("/products", shopController.addProduct);
router.put("/products/:id", shopController.editProduct);
router.delete("/products/:id", shopController.removeProduct);
router.get("/orders", shopController.getOrders);
router.put("/orders/:id/assign-shipper", shopController.assignShipper);
router.get("/shippers", shopController.getShippers);
router.get("/inventory", shopController.getInventory);
router.get("/sales", shopController.getSales);

module.exports = router;