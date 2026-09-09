const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const protect = require("./middleware/auth");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Test API status route
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Customer Support Helpdesk API is running",
        timestamp: new Date()
    });
});

// Protected test route (preserved from original)
app.get("/api/protected", protect, (req, res) => {
    res.json({
        success: true,
        message: "You have access to this protected route",
        user: req.user
    });
});

// Serve frontend build in production or if build directory exists
const frontendDist = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get(/^(?!\/api).+$/, (req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
    });
} else {
    // Preserve original root endpoint when frontend dist is not built yet
    app.get("/", (req, res) => {
        res.json({
            message: "Customer Support Helpdesk API is running"
        });
    });
}

// Centralized error handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});