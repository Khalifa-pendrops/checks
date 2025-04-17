import mongoose, { Document } from "mongoose";

interface IUserMethods {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface IUser extends Document, IUserMethods {
  id: mongoose.Schema.Types.ObjectId;  //watch here
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  languagePreference: string;
  verified?: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
  changedPasswordAfter(JWTTimesstamp: number): boolean;
  createPasswordResetToken(): string;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role?: "user" | "admin";
  languagePreference?: string;
}
