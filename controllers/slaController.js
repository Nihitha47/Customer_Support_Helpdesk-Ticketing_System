const Ticket = require("../models/Ticket");

const checkSlaBreach = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        // Customers can check only their own tickets.
        // Agents can check tickets assigned to them.
        // Managers can check any ticket.
        if (
            (req.user.role === "customer" &&
                ticket.customerId.toString() !== req.user.id.toString()) ||
            (req.user.role === "agent" &&
                ticket.assignedAgentId &&
                ticket.assignedAgentId.toString() !== req.user.id.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        const now = new Date();

        // Resolved/closed tickets are evaluated using their resolution time.
        const referenceTime = ticket.resolvedAt || now;
        const shouldBeBreached =
            ticket.slaDeadline &&
            referenceTime > ticket.slaDeadline;

        if (shouldBeBreached && !ticket.slaBreached) {
            ticket.slaBreached = true;
            ticket.slaBreachedAt = referenceTime;
            await ticket.save();
        }

        res.status(200).json({
            success: true,
            ticketId: ticket._id,
            priority: ticket.priority,
            status: ticket.status,
            slaDeadline: ticket.slaDeadline,
            slaBreached: ticket.slaBreached,
            slaBreachedAt: ticket.slaBreachedAt
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkSlaBreach
};
