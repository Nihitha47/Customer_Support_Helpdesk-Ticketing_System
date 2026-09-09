const express = require("express");
const { body } = require("express-validator");

const {
    createTicket,
    assignTicket,
    updateTicketStatus,
    getTickets,
    getTicketById,
    updateTicketPriority,
    escalateTicket,
    reviewEscalation,
    submitSatisfactionRating,
    getSatisfactionRating
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

// List tickets with role-based scoping and filters
router.get(
    "/",
    protect,
    getTickets
);

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

// Get single ticket details
router.get(
    "/:id",
    protect,
    getTicketById
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

// Assign ticket to an agent (Manager only)
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

// Update ticket status (Agent assigned or Manager)
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

// Update ticket priority (Manager only)
router.put(
    "/:id/priority",
    protect,
    authorizeRoles("manager"),
    [
        body("priority")
            .notEmpty()
            .withMessage("Priority is required")
            .isIn(["Low", "Medium", "High", "Urgent"])
            .withMessage("Invalid priority")
    ],
    validate,
    updateTicketPriority
);

// Escalate ticket (Customer for own ticket, Agent assigned, or Manager)
router.post(
    "/:id/escalate",
    protect,
    [
        body("reason")
            .trim()
            .notEmpty()
            .withMessage("Escalation reason is required")
    ],
    validate,
    escalateTicket
);

// Review escalation (Manager only)
router.put(
    "/:id/escalation-review",
    protect,
    authorizeRoles("manager"),
    reviewEscalation
);

// Submit satisfaction rating (Customer only)
router.post(
    "/:id/satisfaction",
    protect,
    authorizeRoles("customer"),
    [
        body("rating")
            .notEmpty()
            .withMessage("Rating is required")
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating must be an integer between 1 and 5")
    ],
    validate,
    submitSatisfactionRating
);

// Get satisfaction rating
router.get(
    "/:id/satisfaction",
    protect,
    getSatisfactionRating
);

module.exports = router;