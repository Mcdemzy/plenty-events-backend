const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const Waiter = require("../models/Waiter");
const { verifyToken } = require("../utils/jwt");

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      let user;

      // Get user from appropriate model based on role
      if (decoded.role === "vendor") {
        user = await Vendor.findById(decoded.id).select("-password");
      } else if (decoded.role === "waiter") {
        user = await Waiter.findById(decoded.id).select("-password");
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid user role in token",
        });
      }

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists or is deactivated",
        });
      }

      req.user = user;
      req.user.role = decoded.role; // Add role to req.user for authorization

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional: Middleware to check if user is a vendor
exports.vendorOnly = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Access restricted to vendors only",
    });
  }
  next();
};

// Optional: Middleware to check if user is a waiter
exports.waiterOnly = (req, res, next) => {
  if (req.user.role !== "waiter") {
    return res.status(403).json({
      success: false,
      message: "Access restricted to waiters only",
    });
  }
  next();
};
