const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");

const canAccessTicket = (ticket, user) => {
    if (user.role === "manager") return true;

    if (
        user.role === "customer" &&
        ticket.customerId.toString() === user.id.toString()
    ) {
        return true;
    }

    if (
        user.role === "agent" &&
        ticket.assignedAgentId &&
        ticket.assignedAgentId.toString() === user.id.toString()
    ) {
        return true;
    }

    return false;
};

const addComment = async (req, res, next) => {
    try {
        const { message } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        const comment = await Comment.create({
            ticketId: ticket._id,
            userId: req.user.id,
            message
        });

        await comment.populate("userId", "name email role");

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment
        });
    } catch (error) {
        next(error);
    }
};

const getComments = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket"
            });
        }

        const comments = await Comment.find({ ticketId: ticket._id })
            .populate("userId", "name email role")
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addComment,
    getComments
};
