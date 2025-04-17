import { User } from "../models/userModel.js";
import { IUser } from "../interfaces/user.interface.js";
import { IClaim } from "../interfaces/claim.interface.js";
import { Request } from "express";
import { Types } from "mongoose";

export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    role?: string;
    languagePreference?: string;
    // user: IUser & { _id: string };
    // optionally add more user props like email, role, etc.
  };
}
