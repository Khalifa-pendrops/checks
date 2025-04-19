import {
  body,
  validationResult,
  CustomValidator,
  Meta,
} from "express-validator";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

// Custom validator with proper type, hopefully 😉
const passwordMatchValidator: CustomValidator = (value: string, meta: Meta) => {
  return value === meta.req.body.password;
};

// Validation rules for user signup
export const userValidationRules = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("passwordConfirm")
      .custom(passwordMatchValidator)
      .withMessage("Passwords do not match"),
    body("languagePreference").optional().isString(),
  ];
};

// Validation rules for claims
export const claimValidationRules = () => {
  return [
    body("claimType")
      .isIn(["text", "url", "image", "offline"])
      .withMessage("Invalid claim type"),
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 10000 })
      .withMessage("Claim content must be less than 10000 characters"),
    body("language")
      .optional()
      .isString()
      .isLength({ min: 2, max: 5 })
      .withMessage("Language must be a string"),
  ];
};

// Validation rules for languages
export const languageValidationRules = () => {
  return [
    body("code").isString().notEmpty().withMessage("Language code is required"),
    body("name").isString().notEmpty().withMessage("Language name is required"),
    body("nativeName")
      .isString()
      .withMessage("Native name must be a string if used"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ];
};

// Middleware to check validation results
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Format errors more cleanly
  const formattedErrors = errors.array().map((err: any) => {
    // Handle both field errors and general errors
    if ("path" in err) {
      return {
        field: err.path,
        message: err.msg,
      };
    }
    return {
      message: err.msg,
    };
  });

  return next(
    new AppError(
      "Validation failed",
      400,
      formattedErrors // This should match the updated AppError signature
    )
  );
};
