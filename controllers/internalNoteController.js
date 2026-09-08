const InternalNote = require("../models/InternalNote");
const Ticket = require("../models/Ticket");

const canAccessNotes = (ticket, user) => {
    if (user.role === "manager") return true;

    return (
        user.role === "agent" &&
        ticket.assignedAgentId &&
        ticket.assignedAgentId.toString() === user.id.toString()
    );
};

const addInternalNote = async (req, res, next) => {
    try {
        const { note } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessNotes(ticket, req.user)) {
            return res.status(403).json({
                success: false,
                message: "Only the assigned agent or a manager can add internal notes"
            });
        }

        const internalNote = await InternalNote.create({
            ticketId: ticket._id,
            authorId: req.user.id,
            note
        });

        await internalNote.populate("authorId", "name email role");

        res.status(201).json({
            success: true,
            message: "Internal note added successfully",
            internalNote
        });
    } catch (error) {
        next(error);
    }
};

const getInternalNotes = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessNotes(ticket, req.user)) {
            return res.status(403).json({
                success: false,
                message: "Internal notes are visible only to agents and managers"
            });
        }

        const notes = await InternalNote.find({ ticketId: ticket._id })
            .populate("authorId", "name email role")
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addInternalNote,
    getInternalNotes
};
