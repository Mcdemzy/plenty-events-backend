const Waiter = require("../../models/Waiter");
const { generateToken } = require("../../utils/jwt");
const { sendVerificationEmail } = require("./verificationController");

// @desc    Register a new waiter
// @route   POST /api/waiters/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, first name, and last name",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if waiter exists
    const existingWaiter = await Waiter.findOne({ email });
    if (existingWaiter) {
      return res.status(400).json({
        success: false,
        message: "Waiter already exists with this email",
      });
    }

    // Create waiter
    const waiter = await Waiter.create({
      email,
      password,
      firstName,
      lastName,
      phone: phone || "",
    });

    // Generate token
    const token = generateToken(waiter._id, "waiter");

    try {
      await sendVerificationEmail(waiter._id, "waiter");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the registration if email fails
    }

    // Remove password from response
    waiter.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: waiter,
    });
  } catch (error) {
    console.error("Waiter registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login waiter
// @route   POST /api/waiters/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Check for waiter and include password for comparison
    const waiter = await Waiter.findOne({ email }).select("+password");

    if (!waiter || !(await waiter.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!waiter.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // Generate token
    const token = generateToken(waiter._id, "waiter");

    // Remove password from response
    waiter.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: waiter,
    });
  } catch (error) {
    console.error("Waiter login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current logged in waiter
// @route   GET /api/waiters/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const waiter = await Waiter.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    console.error("Get waiter error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching waiter data",
    });
  }
};

// @desc    Update waiter details
// @route   PUT /api/waiters/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    };

    const waiter = await Waiter.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    console.error("Update waiter details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating details",
    });
  }
};

// @desc    Update waiter password
// @route   PUT /api/waiters/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const waiter = await Waiter.findById(req.user.id).select("+password");

    // Check current password
    if (!(await waiter.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    waiter.password = req.body.newPassword;
    await waiter.save();

    // Generate new token
    const token = generateToken(waiter._id, "waiter");

    res.status(200).json({
      success: true,
      token,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update waiter password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating password",
    });
  }
};
