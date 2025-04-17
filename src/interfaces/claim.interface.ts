import { Document, Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { Verdict } from "../types/verdict.type.js";

export interface IClaim extends Document {
  user: IUser | string | IUser | Types.ObjectId;
  claimType: "text" | "url" | "image" | "offline";
  content: string;
  language: string;
  status: "pending" | "processing" | "completed" | "failed";
  // result?: IClaimResult;
  // processingErrors?: string[];
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
      | "unknown"
      | "unverified";
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IClaimInput {
  claimType: "text" | "url" | "image" | "offline" | string;
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
  // verdict: Verdict;
  verdict:
    | "true"
    | "mostly-true"
    | "half-true"
    | "mostly-false"
    | "false"
    | "pants-fire"
    | "unknown"
    | "unverified";
}

// export interface IClaimResult {
//   claimView: Array<{
//     text: string;
//     claimReview: Array<{
//       publisher: {
//         name: string;
//         site: string;
//       };
//       url: string;
//       reviewRating?: {
//         ratingValue: number;
//         alternateName: Verdict;
//       };
//     }>;
//   }>;
//   accuracy: number;
//   verdict: Verdict;
// }
