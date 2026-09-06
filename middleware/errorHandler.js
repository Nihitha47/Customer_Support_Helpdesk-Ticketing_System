const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    // Duplicate value error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: "Duplicate value already exists"
        });
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;