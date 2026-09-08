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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Ticket", ticketSchema);