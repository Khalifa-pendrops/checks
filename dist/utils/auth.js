import jwt from "jsonwebtoken";
import config from "../config/index.config.js";
const { jwt_secret, expires_in } = config;
export const createToken = (id, role) => {
    const payload = {
        id: id.toString(),
        role,
    };
    const options = {
        expiresIn: expires_in,
    };
    return jwt.sign(payload, jwt_secret, options);
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwt_secret);
    }
    catch (error) {
        console.error("Token verification failed:", error);
        throw error;
    }
};
