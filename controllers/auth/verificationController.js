const crypto = require("crypto");
const Vendor = require("../../models/Vendor");
const Waiter = require("../../models/Waiter");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../../utils/email");

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email (to be called after registration)
const sendVerificationEmailHandler = async (userId, userType) => {
  try {
    let user;
    const verificationToken = generateVerificationToken();
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    if (userType === "vendor") {
      user = await Vendor.findByIdAndUpdate(
        userId,
        {
          "verification.emailVerificationToken": verificationToken,
          "verification.emailVerificationExpires": verificationExpires,
        },
        { new: true }
      );
    } else if (userType === "waiter") {
      user = await Waiter.findByIdAndUpdate(
        userId,
        {
          "verification.emailVerificationToken": verificationToken,
          "verification.emailVerificationExpires": verificationExpires,
        },
        { new: true }
      );
    } else {
      throw new Error("Invalid user type");
    }

    if (!user) {
      throw new Error("User not found");
    }

    await sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken,
      userType
    );

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Verify email endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { token, type } = req.query;

    if (!token || !type) {
      return res.status(400).json({
        success: false,
        message: "Verification token and user type are required",
      });
    }

    let user;
    if (type === "vendor") {
      user = await Vendor.findOne({
        "verification.emailVerificationToken": token,
        "verification.emailVerificationExpires": { $gt: Date.now() },
      });
    } else if (type === "waiter") {
      user = await Waiter.findOne({
        "verification.emailVerificationToken": token,
        "verification.emailVerificationExpires": { $gt: Date.now() },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    user.verification.isEmailVerified = true;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email and user type are required",
      });
    }

    let user;
    if (userType === "vendor") {
      user = await Vendor.findOne({ email });
    } else if (userType === "waiter") {
      user = await Waiter.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verification.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const result = await sendVerificationEmailHandler(user._id, userType);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification email",
    });
  }
};

// Export the sendVerificationEmail function for use in auth controllers
exports.sendVerificationEmail = sendVerificationEmailHandler;
