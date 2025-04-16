import { Document } from "mongoose";
import { IUser } from "./user.interface.js";

export interface IClaim extends Document {
  user: IUser["_id"];
  claimType: "text" | "url" | "image" | "offline";
  content: string;
  language: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    claimView: any[];
    accuracy: number;
    verdict:
      | "true"
      | "mostly-true"
      | "half-true"
      | "mostly-false"
      | "false"
      | "pants-fire"
      | "unknown";
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IClaimInput {
  claimType: "text" | "url" | "image" | "offline";
  content: string;
  language?: string;
  userId?: string; //this is optional cause the controller adds it
}

export interface IClaimUpdateInput {
  language?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface IClaimResult {
  claimReview: any[];
  accuracy: number;
  verdict:
    | "true"
    | "mostly-true"
    | "half-true"
    | "mostly-false"
    | "false"
    | "pants-fire"
    | "unknown";
}
