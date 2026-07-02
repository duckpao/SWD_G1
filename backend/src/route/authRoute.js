const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/register-admin", authController.registerAdmin);
router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.get("/activate", authController.activateAccount);

module.exports = router;