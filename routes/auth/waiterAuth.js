const express = require("express");
const { waiterAuth } = require("../../controllers/auth");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.post("/register", waiterAuth.register);
router.post("/login", waiterAuth.login);
router.get("/me", protect, waiterAuth.getMe);
router.put("/updatedetails", protect, waiterAuth.updateDetails);
router.put("/updatepassword", protect, waiterAuth.updatePassword);

module.exports = router;
