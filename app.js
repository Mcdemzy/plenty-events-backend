const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow your frontend domains
    const allowedOrigins = [
      "http://localhost:5173", // Local development
      "http://localhost:3000", // Another local port
      "https://your-frontend-domain.vercel.app", // Your frontend Vercel domain
      "https://plenty-events.vercel.app", // Example - replace with your actual domain
    ];

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes/auth"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);

  // Handle CORS errors
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Request not allowed",
    });
  }

  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
