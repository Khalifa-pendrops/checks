import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.config.js";
import AppError from "../utils/appError.js";
import { AuthenticatedRequest } from "../types/custom.js";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = jwt.verify(token, config.jwt_secret as string) as {
      id: string;
    };

    // You can add user to request here if needed
    req.user = { _id: decoded.id };

    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Implement role-based access control if needed

    const userRole = req.user.role || "user"; // Default to "user" if role is undefined

    //check if role is undefined to avoid assigning a default value
    if (!userRole || !roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
