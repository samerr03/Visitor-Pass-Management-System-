const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require('path'); // Added for path resolution
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();


// Connect MongoDB
// Connect MongoDB - Handled in server.js via config/db.js
// mongoose
//     .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management')
//     .then(() => console.log("MongoDB Connected"))
//     .catch((err) => console.log("Mongo Error:", err.message));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow frontend
    credentials: true,
}));

const rateLimit = require('express-rate-limit');
const modelContext = require('./middleware/modelContext');
const demoGuard = require('./middleware/demoGuard');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // Increased from 100
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Increased from 20 to prevent 429 during testing
    message: "Too many login attempts, please try again later"
});

const visitorWriteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // Increased from 10
    message: "Rate limit exceeded for visitor operations"
});

// Apply global limiter
app.use(limiter);

// Specific limiters will be applied in routes if needed, or we can apply broadly here
// For now, let's keep it simple.

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/visitors", visitorWriteLimiter, visitorRoutes);
app.use("/api/audit-logs", auditRoutes);

const passRoutes = require("./routes/passRoutes");
app.use("/api/passes", passRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get("/", (req, res) => {
    res.send("API Working");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
