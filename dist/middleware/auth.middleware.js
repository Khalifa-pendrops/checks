import jwt from "jsonwebtoken";
import config from "../config/index.config.js";
import AppError from "../utils/appError.js";
export const protect = (req, res, next) => {
    //for debugging purpose only
    console.log("Incoming Headers:", JSON.stringify(req.headers));
    console.log("Auth Header:", req.headers.authorization);
    // 1. Check Authorization header format
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }
    // 2. Extract token
    const token = authHeader.split(" ")[1].replace(/"/g, ""); // Remove all quotes from token;
    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }
    // Use config consistently
    const { jwt_secret } = config;
    try {
        console.log("Verifying token with secret length:", jwt_secret.length);
        const decoded = jwt.verify(token, jwt_secret);
        // Validate decoded payload
        if (!decoded.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        req.user = { _id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            console.error("JWT Error:", error.message);
            return res.status(401).json({
                message: "Invalid token",
                details: error.message,
            });
        }
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return next(new AppError("User role not found", 403));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};
