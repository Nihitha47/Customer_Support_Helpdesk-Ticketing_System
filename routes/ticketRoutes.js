const express = require("express");
const { body } = require("express-validator");

const {
    createTicket,
    assignTicket,
    updateTicketStatus
} = require("../controllers/ticketController");

const { checkSlaBreach } = require("../controllers/slaController");
const { addComment, getComments } = require("../controllers/commentController");
const {
    addInternalNote,
    getInternalNotes
} = require("../controllers/internalNoteController");

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


// Check SLA deadline and breach status
router.get(
    "/:id/sla",
    protect,
    checkSlaBreach
);

// Add a public customer/agent reply
router.post(
    "/:id/comments",
    protect,
    [
        body("message")
            .trim()
            .notEmpty()
            .withMessage("Comment message is required")
    ],
    validate,
    addComment
);

// Get the public reply thread
router.get(
    "/:id/comments",
    protect,
    getComments
);

// Add an internal note (agent/manager only)
router.post(
    "/:id/notes",
    protect,
    authorizeRoles("agent", "manager"),
    [
        body("note")
            .trim()
            .notEmpty()
            .withMessage("Internal note is required")
    ],
    validate,
    addInternalNote
);

// Get internal notes (agent/manager only)
router.get(
    "/:id/notes",
    protect,
    authorizeRoles("agent", "manager"),
    getInternalNotes
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