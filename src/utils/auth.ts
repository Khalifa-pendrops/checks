import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config/index.config.js";
import mongoose, { Types } from "mongoose";

const { jwt_secret, expires_in } = config;

type Duration = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}` | number;

export const createToken = (id: Types.ObjectId | string): string => {
  const payload = { id: id.toString() };

  const options: SignOptions = {
    expiresIn: expires_in as Duration,
  };

  return jwt.sign(payload, jwt_secret as Secret, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, jwt_secret as Secret);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};
