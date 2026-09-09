const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Category = require("../models/Category");
const SatisfactionRating = require("../models/SatisfactionRating");
const { calculateSlaDeadline } = require("../utils/sla");

const createTicket = async (req, res, next) => {
    try {
        const { subject, description, category, priority } = req.body;

        // Check if categories are configured; if active categories exist, ensure requested category is active
        const activeCategory = await Category.findOne({ name: category, isActive: true });
        const categoriesExist = await Category.countDocuments();
        if (categoriesExist > 0 && !activeCategory) {
            return res.status(400).json({
                success: false,
                message: `Category '${category}' is either inactive or does not exist`
            });
        }

        const selectedPriority = priority || "Medium";
        const createdAt = new Date();

        const ticket = await Ticket.create({
            customerId: req.user.id,
            subject,
            description,
            category,
            priority: selectedPriority,
            slaDeadline: calculateSlaDeadline(selectedPriority, createdAt)
        });

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket
        });
    } catch (error) {
        next(error);
    }
};

const assignTicket = async (req, res, next) => {
    try {
        const { agentId } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const agent = await User.findById(agentId);

        if (!agent || agent.role !== "agent") {
            return res.status(400).json({
                success: false,
                message: "Invalid agent ID"
            });
        }

        ticket.assignedAgentId = agentId;
        ticket.status = "In Progress";

        await ticket.save();

        res.status(200).json({
            success: true,
            message: "Ticket assigned successfully",
            ticket
        });

    } catch (error) {
        next(error);
    }
};

const updateTicketStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (
            req.user.role === "agent" &&
            ticket.assignedAgentId &&
            ticket.assignedAgentId.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update tickets assigned to you"
            });
        }

        const validStatuses = [
            "Open",
            "In Progress",
            "Resolved",
            "Closed"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket status"
            });
        }

        const allowedTransitions = {
            "Open": ["In Progress"],
            "In Progress": ["Resolved"],
            "Resolved": ["Closed"],
            "Closed": []
        };

        if (!allowedTransitions[ticket.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${ticket.status} to ${status}`
            });
        }

        ticket.status = status;

        if (status === "Resolved" && !ticket.resolvedAt) {
            ticket.resolvedAt = new Date();

            if (ticket.slaDeadline && ticket.resolvedAt > ticket.slaDeadline) {
                ticket.slaBreached = true;
                ticket.slaBreachedAt = ticket.resolvedAt;
            }
        }

        await ticket.save();

        res.status(200).json({
            success: true,
            message: "Ticket status updated successfully",
            ticket
        });

    } catch (error) {
        next(error);
    }
};

// Get tickets with role-based scoping, filtering, search, and sorting
const getTickets = async (req, res, next) => {
    try {
        const filter = {};

        // Role-based scoping
        if (req.user.role === "customer") {
            filter.customerId = req.user.id;
        } else if (req.user.role === "agent") {
            if (req.query.scope === "unassigned") {
                filter.assignedAgentId = null;
                filter.status = "Open";
            } else if (req.query.scope === "all") {
                // Agent viewing active queue
            } else {
                filter.assignedAgentId = req.user.id;
            }
        }
        // Managers have organization-wide visibility

        // Query filters
        if (req.query.status) {
            if (req.query.status.includes(",")) {
                filter.status = { $in: req.query.status.split(",").map(s => s.trim()) };
            } else {
                filter.status = req.query.status;
            }
        }

        if (req.query.priority) {
            if (req.query.priority.includes(",")) {
                filter.priority = { $in: req.query.priority.split(",").map(p => p.trim()) };
            } else {
                filter.priority = req.query.priority;
            }
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.assignedAgentId) {
            filter.assignedAgentId = req.query.assignedAgentId;
        }

        if (req.query.customerId && req.user.role !== "customer") {
            filter.customerId = req.query.customerId;
        }

        if (req.query.slaBreached !== undefined) {
            filter.slaBreached = req.query.slaBreached === "true";
        }

        if (req.query.isEscalated !== undefined) {
            filter.isEscalated = req.query.isEscalated === "true";
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search.trim(), "i");
            filter.$or = [
                { subject: searchRegex },
                { description: searchRegex }
            ];
        }

        // Sorting
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const total = await Ticket.countDocuments(filter);
        const tickets = await Ticket.find(filter)
            .populate("customerId", "name email role")
            .populate("assignedAgentId", "name email role")
            .populate("escalatedBy", "name email role")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: tickets.length,
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            tickets
        });
    } catch (error) {
        next(error);
    }
};

// Get single ticket details with authorization check and dynamic SLA check
const getTicketById = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("customerId", "name email role")
            .populate("assignedAgentId", "name email role")
            .populate("escalatedBy", "name email role")
            .populate("escalationHistory.escalatedBy", "name email role");

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        // Authorization check
        if (req.user.role === "customer" && ticket.customerId._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        if (
            req.user.role === "agent" &&
            ticket.assignedAgentId &&
            ticket.assignedAgentId._id.toString() !== req.user.id.toString()
        ) {
            // Unassigned tickets can be inspected by agents in queue, but tickets assigned to other agents are restricted
            return res.status(403).json({
                success: false,
                message: "You do not have access to tickets assigned to another agent"
            });
        }

        // Check and persist SLA breach if deadline has passed while active
        if (!ticket.resolvedAt && ticket.slaDeadline && new Date() > ticket.slaDeadline && !ticket.slaBreached) {
            ticket.slaBreached = true;
            ticket.slaBreachedAt = ticket.slaDeadline;
            await ticket.save();
        }

        res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        next(error);
    }
};

// Update ticket priority (Manager only) with SLA deadline recalculation
const updateTicketPriority = async (req, res, next) => {
    try {
        const { priority } = req.body;

        const validPriorities = ["Low", "Medium", "High", "Urgent"];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority level"
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        ticket.priority = priority;

        // Recalculate SLA if ticket is still in progress or open
        if (ticket.status === "Open" || ticket.status === "In Progress") {
            ticket.slaDeadline = calculateSlaDeadline(priority, ticket.createdAt);
            const now = new Date();
            if (now > ticket.slaDeadline) {
                ticket.slaBreached = true;
                ticket.slaBreachedAt = ticket.slaDeadline;
            } else {
                ticket.slaBreached = false;
                ticket.slaBreachedAt = null;
            }
        }

        await ticket.save();

        res.status(200).json({
            success: true,
            message: "Ticket priority updated successfully",
            ticket
        });
    } catch (error) {
        next(error);
    }
};

// Trigger escalation (Customer for own ticket, Agent for assigned, or Manager)
const escalateTicket = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        // Authorization check
        if (req.user.role === "customer" && ticket.customerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only escalate your own tickets"
            });
        }

        if (
            req.user.role === "agent" &&
            ticket.assignedAgentId &&
            ticket.assignedAgentId.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only escalate tickets assigned to you"
            });
        }

        const newLevel = (ticket.escalationLevel || 0) + 1;
        const now = new Date();

        ticket.isEscalated = true;
        ticket.escalationLevel = newLevel;
        ticket.escalationStatus = "Escalated";
        ticket.escalationReason = reason;
        ticket.escalatedAt = now;
        ticket.escalatedBy = req.user.id;

        ticket.escalationHistory.push({
            level: newLevel,
            status: "Escalated",
            reason,
            escalatedAt: now,
            escalatedBy: req.user.id,
            action: `Escalation triggered by ${req.user.role}`
        });

        await ticket.save();

        await ticket.populate("customerId", "name email role");
        await ticket.populate("assignedAgentId", "name email role");
        await ticket.populate("escalatedBy", "name email role");

        res.status(200).json({
            success: true,
            message: "Ticket escalated successfully",
            ticket
        });
    } catch (error) {
        next(error);
    }
};

// Review and manage escalation (Manager only)
const reviewEscalation = async (req, res, next) => {
    try {
        const { escalationStatus, reassignAgentId, priority, note } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const validStatuses = ["Under Review", "Resolved", "Escalated"];
        if (escalationStatus && !validStatuses.includes(escalationStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid escalation status"
            });
        }

        if (reassignAgentId) {
            const agent = await User.findById(reassignAgentId);
            if (!agent || agent.role !== "agent") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid agent for reassignment"
                });
            }
            ticket.assignedAgentId = reassignAgentId;
            if (ticket.status === "Open") {
                ticket.status = "In Progress";
            }
        }

        if (priority) {
            const validPriorities = ["Low", "Medium", "High", "Urgent"];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority"
                });
            }
            ticket.priority = priority;
            if (ticket.status === "Open" || ticket.status === "In Progress") {
                ticket.slaDeadline = calculateSlaDeadline(priority, ticket.createdAt);
            }
        }

        if (escalationStatus) {
            ticket.escalationStatus = escalationStatus;
            if (escalationStatus === "Resolved") {
                ticket.isEscalated = false;
            }
        }

        ticket.escalationHistory.push({
            level: ticket.escalationLevel,
            status: ticket.escalationStatus,
            reason: ticket.escalationReason,
            escalatedAt: new Date(),
            escalatedBy: req.user.id,
            note: note || "Escalation review updated by manager",
            action: `Escalation status set to ${ticket.escalationStatus}`
        });

        await ticket.save();

        await ticket.populate("customerId", "name email role");
        await ticket.populate("assignedAgentId", "name email role");
        await ticket.populate("escalatedBy", "name email role");

        res.status(200).json({
            success: true,
            message: "Escalation reviewed successfully",
            ticket
        });
    } catch (error) {
        next(error);
    }
};

// Submit Customer Satisfaction Rating (Customer only, for resolved/closed ticket)
const submitSatisfactionRating = async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        // Only the ticket's customer can submit
        if (ticket.customerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only rate your own tickets"
            });
        }

        // Rating is permitted only after resolution or closure
        if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
            return res.status(400).json({
                success: false,
                message: "Satisfaction ratings can only be submitted for resolved or closed tickets"
            });
        }

        // Validate rating range 1 - 5
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check for duplicate submission
        const existingRating = await SatisfactionRating.findOne({ ticketId: ticket._id });
        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: "A satisfaction rating has already been submitted for this ticket"
            });
        }

        const satisfactionRating = await SatisfactionRating.create({
            ticketId: ticket._id,
            customerId: req.user.id,
            rating: numericRating,
            feedback: feedback ? feedback.trim() : ""
        });

        res.status(201).json({
            success: true,
            message: "Thank you for your feedback! Rating submitted successfully.",
            rating: satisfactionRating
        });
    } catch (error) {
        next(error);
    }
};

// Get satisfaction rating for a ticket
const getSatisfactionRating = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        // Authorization check
        if (req.user.role === "customer" && ticket.customerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        if (
            req.user.role === "agent" &&
            ticket.assignedAgentId &&
            ticket.assignedAgentId.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        const rating = await SatisfactionRating.findOne({ ticketId: ticket._id });

        res.status(200).json({
            success: true,
            rating: rating || null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};