import { User } from "../models/userModel.js";
import { Request } from "express";
import { Types } from "mongoose";

export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    role?: string;
    // optionally add more user props like email, role, etc.
  };
}
