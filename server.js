const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const protect = require("./middleware/auth");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Customer Support Helpdesk API is running"
    });
});

// Protected test route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        success: true,
        message: "You have access to this protected route",
        user: req.user
    });
});

// Centralized error handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});