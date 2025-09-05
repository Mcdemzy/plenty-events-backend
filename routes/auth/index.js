const express = require("express");
const vendorAuthRoutes = require("./vendorAuth");
const waiterAuthRoutes = require("./waiterAuth");

const router = express.Router();

// Mount routes
router.use("/vendors/auth", vendorAuthRoutes);
router.use("/waiters/auth", waiterAuthRoutes);

module.exports = router;
