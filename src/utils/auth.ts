import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config/index.config.js";
import mongoose, { Types } from "mongoose";

// Ensure the secret is defined
const jwtSecret = config.jwt_secret;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in the environment");
}

export const createToken = (id: Types.ObjectId | string): string => {
  const payload = { id: id.toString() };
  const options: SignOptions = {
    expiresIn: config.expires_in || ("1d" as any),
  };

  return jwt.sign(payload, jwtSecret as Secret, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, jwtSecret as Secret);
};
