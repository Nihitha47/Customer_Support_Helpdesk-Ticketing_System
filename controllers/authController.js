const User = require("../models/User");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "customer"
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get current authenticated user details
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get list of support agents (for assignment)
const getAgents = async (req, res, next) => {
    try {
        const agents = await User.find({ role: "agent" })
            .select("name email role")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: agents.length,
            agents
        });
    } catch (error) {
        next(error);
    }
};

// Initial database seed helper for development/testing roles & categories
const seedInitialData = async (req, res, next) => {
    try {
        const defaultCategories = [
            { name: "Technical Support", description: "Hardware, software, and system troubleshooting" },
            { name: "Billing & Invoicing", description: "Payment processing, invoice inquiries, and subscription management" },
            { name: "Account Access", description: "Password resets, credential verification, and account security" },
            { name: "Feature Request", description: "Product enhancements, suggestions, and feedback" },
            { name: "General Inquiry", description: "General questions and assistance" }
        ];

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create({ ...cat, isActive: true });
            }
        }

        // Seed users if empty
        const defaultUsers = [
            { name: "Support Manager", email: "manager@helpdesk.com", password: "Manager@123", role: "manager" },
            { name: "Sarah Jenkins", email: "sarah.agent@helpdesk.com", password: "Agent@123", role: "agent" },
            { name: "David Miller", email: "david.agent@helpdesk.com", password: "Agent@123", role: "agent" },
            { name: "Alex Robinson", email: "alex.customer@example.com", password: "Customer@123", role: "customer" }
        ];

        const createdUsers = [];
        for (const u of defaultUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                const newUser = await User.create({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role
                });
                createdUsers.push({ email: newUser.email, role: newUser.role });
            }
        }

        res.status(200).json({
            success: true,
            message: "Initial categories and users verified/seeded successfully",
            seededUsers: createdUsers
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAgents,
    seedInitialData
};