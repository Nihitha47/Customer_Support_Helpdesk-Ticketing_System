const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");
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
module.exports = router;