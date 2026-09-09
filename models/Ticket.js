const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium"
        },

        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved", "Closed"],
            default: "Open"
        },

        assignedAgentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Member 2: SLA tracking
        slaDeadline: {
            type: Date,
            default: null
        },

        slaBreached: {
            type: Boolean,
            default: false
        },

        slaBreachedAt: {
            type: Date,
            default: null
        },

        resolvedAt: {
            type: Date,
            default: null
        },

        // Escalation tracking
        isEscalated: {
            type: Boolean,
            default: false
        },

        escalationLevel: {
            type: Number,
            default: 0
        },

        escalationStatus: {
            type: String,
            enum: ["None", "Pending Review", "Under Review", "Escalated", "Resolved"],
            default: "None"
        },

        escalationReason: {
            type: String,
            default: null
        },

        escalatedAt: {
            type: Date,
            default: null
        },

        escalatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        escalationHistory: [
            {
                level: { type: Number, default: 1 },
                status: { type: String, default: "Escalated" },
                reason: { type: String },
                escalatedAt: { type: Date, default: Date.now },
                escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                note: { type: String },
                action: { type: String }
            }
        ]
    },
    {
        timestamps: true
    }
);

ticketSchema.index({ customerId: 1 });
ticketSchema.index({ assignedAgentId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ isEscalated: 1 });
ticketSchema.index({ slaBreached: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);