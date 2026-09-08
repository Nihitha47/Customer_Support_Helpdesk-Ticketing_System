const mongoose = require("mongoose");

const internalNoteSchema = new mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
            index: true
        },

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        note: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("InternalNote", internalNoteSchema);
