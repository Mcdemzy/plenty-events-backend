const express = require("express");
const vendorAuthRoutes = require("./vendorAuth");
const waiterAuthRoutes = require("./waiterAuth");
const verificationRoutes = require("./verification"); // Add this

const router = express.Router();

// Mount routes
router.use("/vendors/auth", vendorAuthRoutes);
router.use("/waiters/auth", waiterAuthRoutes);
router.use("/verification", verificationRoutes); // Add this

module.exports = router;
