const express = require("express");
const { body } = require("express-validator");

const {
    createTicket,
    assignTicket,
    updateTicketStatus
} = require("../controllers/ticketController");

const protect = require("../middleware/auth");
const validate = require("../middleware/validate");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// Create a new ticket
router.post(
    "/",
    protect,
    [
        body("subject")
            .trim()
            .notEmpty()
            .withMessage("Subject is required"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required"),

        body("category")
            .trim()
            .notEmpty()
            .withMessage("Category is required"),

        body("priority")
            .optional()
            .isIn(["Low", "Medium", "High", "Urgent"])
            .withMessage("Invalid priority")
    ],
    validate,
    createTicket
);

// Assign ticket to an agent
router.put(
    "/:id/assign",
    protect,
    authorizeRoles("manager"),
    [
        body("agentId")
            .notEmpty()
            .withMessage("Agent ID is required")
            .isMongoId()
            .withMessage("Invalid agent ID")
    ],
    validate,
    assignTicket
);

// Update ticket status
router.put(
    "/:id/status",
    protect,
    authorizeRoles("agent", "manager"),
    [
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(["Open", "In Progress", "Resolved", "Closed"])
            .withMessage("Invalid ticket status")
    ],
    validate,
    updateTicketStatus
);

module.exports = router;