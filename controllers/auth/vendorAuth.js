const Vendor = require("../../models/Vendor");
const { generateToken } = require("../../utils/jwt");

// @desc    Register a new vendor
// @route   POST /api/vendors/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, businessName, businessDescription } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !businessName || !businessDescription) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: email, password, first name, last name, business name, and business description",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists with this email",
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      email,
      password,
      firstName,
      lastName,
      phone: phone || "",
      businessName,
      businessDescription
    });

    // Generate token
    const token = generateToken(vendor._id, 'vendor');

    // Remove password from response
    vendor.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: vendor,
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login vendor
// @route   POST /api/vendors/auth/login
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

    // Check for vendor and include password for comparison
    const vendor = await Vendor.findOne({ email }).select("+password");

    if (!vendor || !(await vendor.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // Generate token
    const token = generateToken(vendor._id, 'vendor');

    // Remove password from response
    vendor.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: vendor,
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current logged in vendor
// @route   GET /api/vendors/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching vendor data",
    });
  }
};

// @desc    Update vendor details
// @route   PUT /api/vendors/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      businessName: req.body.businessName,
      businessDescription: req.body.businessDescription,
    };

    const vendor = await Vendor.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Update vendor details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating details",
    });
  }
};

// @desc    Update vendor password
// @route   PUT /api/vendors/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("+password");

    // Check current password
    if (!(await vendor.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    vendor.password = req.body.newPassword;
    await vendor.save();

    // Generate new token
    const token = generateToken(vendor._id, 'vendor');

    res.status(200).json({
      success: true,
      token,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update vendor password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating password",
    });
  }
};