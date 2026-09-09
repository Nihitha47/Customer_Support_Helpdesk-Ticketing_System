const express = require("express");
const { body } = require("express-validator");
const {
    registerUser,
    loginUser,
    getMe,
    getAgents,
    seedInitialData
} = require("../controllers/authController");
const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const validate = require("../middleware/validate");

const router = express.Router();

// Register user
router.post(
    "/register",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .isEmail()
            .withMessage("Please provide a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")

    ],
    validate,
    registerUser
);

// Login user
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please provide a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    validate,
    loginUser
);

// Get current user profile
router.get(
    "/me",
    protect,
    getMe
);

// Get agents list (Manager or Agent)
router.get(
    "/agents",
    protect,
    authorizeRoles("agent", "manager"),
    getAgents
);

// Seed initial roles/categories helper
router.post(
    "/seed",
    seedInitialData
);

module.exports = router;