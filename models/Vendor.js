const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const vendorSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },

    // Business information
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessDescription: {
      type: String,
      required: true,
    },

    // Personal information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },

    // Services
    services: [
      {
        type: String,
        required: true,
      },
    ],
    serviceCategories: [
      {
        type: String,
        enum: [
          "Catering",
          "Drinks",
          "Cocktails",
          "Decorators",
          "Venue",
          "Photography",
          "Entertainment",
        ],
        required: true,
      },
    ],

    // Pricing
    pricing: {
      hourlyRate: Number,
      dailyRate: Number,
      packageDeals: [
        {
          name: String,
          price: Number,
          description: String,
        },
      ],
    },

    // Location
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // Contact
    contactInfo: {
      phone: String,
      alternatePhone: String,
      website: String,
      socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
      },
    },

    // Verification
    verification: {
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      isVerified: { type: Boolean, default: false },
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      documents: [
        {
          type: {
            type: String,
            enum: ["ID", "BusinessLicense", "Insurance", "Other"],
          },
          url: String,
          uploadedAt: Date,
        },
      ],
      verifiedAt: Date,
    },

    // Stats
    stats: {
      totalHires: { type: Number, default: 0 },
      completedJobs: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
    },

    // Availability
    availability: {
      isAvailable: { type: Boolean, default: true },
      unavailableDates: [Date],
      workingHours: {
        monday: { start: String, end: String },
        tuesday: { start: String, end: String },
        wednesday: { start: String, end: String },
        thursday: { start: String, end: String },
        friday: { start: String, end: String },
        saturday: { start: String, end: String },
        sunday: { start: String, end: String },
      },
    },

    // Additional vendor-specific fields
    portfolio: [
      {
        imageUrl: String,
        description: String,
        date: Date,
      },
    ],
    teamSize: Number,
    yearsOfExperience: Number,

    // Account status
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Vendor", vendorSchema);
