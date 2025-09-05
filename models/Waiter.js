const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const waiterSchema = new mongoose.Schema(
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

    // Skills and experience
    skills: [
      {
        type: String,
        required: true,
      },
    ],
    experience: {
      years: Number,
      previousWork: [
        {
          company: String,
          position: String,
          duration: String,
          description: String,
        },
      ],
    },

    // Personal details
    personalInfo: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      nationality: String,
      identification: {
        type: {
          type: String,
          enum: ["National ID", "Passport", "Driver License"],
        },
        number: String,
        imageUrl: String,
      },
    },

    // Contact information
    contactInfo: {
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
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
            enum: ["ID", "Certificate", "Resume", "BackgroundCheck", "Other"],
          },
          url: String,
          uploadedAt: Date,
        },
      ],
      verifiedAt: Date,
    },

    // Availability
    availability: {
      isAvailable: { type: Boolean, default: true },
      unavailableDates: [Date],
      preferredShifts: [
        {
          type: String,
          enum: ["Morning", "Afternoon", "Evening", "Night"],
        },
      ],
    },

    // Stats
    stats: {
      jobsCompleted: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reliabilityScore: { type: Number, default: 100 },
    },

    // Additional fields
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expirationDate: Date,
        certificateUrl: String,
      },
    ],
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
        },
      },
    ],
    guarantorDetails: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: String,
    },

    // Account status
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Current employment (if hired by a vendor)
    employedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    hireStatus: {
      type: String,
      enum: ["available", "hired", "unavailable"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
waiterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
waiterSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Waiter", waiterSchema);
