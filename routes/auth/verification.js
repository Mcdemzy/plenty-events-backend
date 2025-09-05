const express = require("express");
const {
  verifyEmail,
  resendVerificationEmail,
} = require("../../controllers/auth/verificationController");

const router = express.Router();

// Verify email
router.get("/verify-email", verifyEmail);

// Resend verification email
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;