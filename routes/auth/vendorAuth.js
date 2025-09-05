const express = require("express");
const { vendorAuth } = require("../../controllers/auth");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.post("/register", vendorAuth.register);
router.post("/login", vendorAuth.login);
router.get("/me", protect, vendorAuth.getMe);
router.put("/updatedetails", protect, vendorAuth.updateDetails);
router.put("/updatepassword", protect, vendorAuth.updatePassword);

module.exports = router;
