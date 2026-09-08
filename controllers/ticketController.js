const Ticket = require("../models/Ticket");
const { calculateSlaDeadline } = require("../utils/sla");

const createTicket = async (req, res, next) => {
    try {
        const { subject, description, category, priority } = req.body;
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

        const User = require("../models/User");

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

        // Allowed workflow transitions
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

module.exports = {
    createTicket,
    assignTicket,
    updateTicketStatus
};