const errorMiddleware = (err, req, res, next) => {
    // Handle JSON parse errors (for example invalid JSON body)
    if (err.type === "entity.parse.failed") {
        err.statusCode = 400;
        err.message = "Invalid JSON payload.";
        err.isOperational = true;
    }
    // Set default values if not already set
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // Prevent double sending response
    if (res.headersSent) {
        return next(err);
    }
    if (process.env.NODE_ENV === "development") {
        console.error("Error Stack 🧱", err.stack); // Optional detailed log in development purpose
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message || "An unexpected error occurred.",
            stack: err.stack,
            errors: err.errors || null,
        });
    }
    else {
        // Production environment
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message || "An unexpected error occurred.",
                errors: err.errors || null,
            });
        }
        else {
            console.error("ERROR 💥", err);
            res.status(500).json({
                status: "error",
                message: "Oops 🚫 Something went very wrong!",
            });
        }
    }
};
export default errorMiddleware;
