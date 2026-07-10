const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register-admin", authController.registerAdmin);
router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.get("/activate", authController.activateAccount);
router.get("/me", protect, authController.getProfile);

module.exports = router;