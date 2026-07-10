const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.get("/:id", productController.getProductDetail);

module.exports = router;