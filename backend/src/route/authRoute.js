const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register-admin", authController.registerAdmin);
router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.get("/activate", authController.activateAccount);

router.get("/me", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);
router.post("/logout", protect, authController.logout);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

module.exports = router;