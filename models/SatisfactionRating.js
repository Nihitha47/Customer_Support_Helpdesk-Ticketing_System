const mongoose = require("mongoose");

const satisfactionRatingSchema = new mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
            unique: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        feedback: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

satisfactionRatingSchema.index({ customerId: 1 });
satisfactionRatingSchema.index({ rating: 1 });

module.exports = mongoose.model("SatisfactionRating", satisfactionRatingSchema);
