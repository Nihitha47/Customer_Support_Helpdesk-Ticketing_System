const express = require("express");
const { body } = require("express-validator");
const {
    getCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus
} = require("../controllers/categoryController");

const protect = require("../middleware/auth");
const validate = require("../middleware/validate");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// Optional auth so customers/visitors can fetch categories, but managers can pass token to see all
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return protect(req, res, next);
    }
    next();
};

// Get categories (active ones by default)
router.get("/", optionalAuth, getCategories);

// Create category (Manager only)
router.post(
    "/",
    protect,
    authorizeRoles("manager"),
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Category name is required")
    ],
    validate,
    createCategory
);

// Update category (Manager only)
router.put(
    "/:id",
    protect,
    authorizeRoles("manager"),
    updateCategory
);

// Toggle category active status (Manager only)
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("manager"),
    toggleCategoryStatus
);

module.exports = router;
