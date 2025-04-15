import jwt from "jsonwebtoken";
import config from "../config/index.config.js";
// Ensure the secret is defined
const jwtSecret = config.jwt_secret;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in the environment");
}
export const createToken = (id) => {
    const payload = { id: id.toString() };
    const options = {
        expiresIn: config.expires_in || "1d",
    };
    return jwt.sign(payload, jwtSecret, options);
};
export const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};
