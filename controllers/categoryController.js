const Category = require("../models/Category");

// Get categories (active only by default; includeInactive allowed for managers)
const getCategories = async (req, res, next) => {
    try {
        const query = {};
        const isManager = req.user && req.user.role === "manager";
        
        if (!isManager || req.query.includeInactive !== "true") {
            query.isActive = true;
        }

        const categories = await Category.find(query).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// Create a new category (Manager only)
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description ? description.trim() : "",
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });
    } catch (error) {
        next(error);
    }
};

// Update an existing category (Manager only)
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, isActive } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (name && name.trim() !== category.name) {
            const duplicate = await Category.findOne({
                _id: { $ne: category._id },
                name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }
            category.name = name.trim();
        }

        if (description !== undefined) {
            category.description = description.trim();
        }

        if (isActive !== undefined) {
            category.isActive = Boolean(isActive);
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        next(error);
    }
};

// Toggle category active status (Manager only)
const toggleCategoryStatus = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
            category
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus
};
