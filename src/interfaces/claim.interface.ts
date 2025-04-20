import { Document, Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { Verdict } from "../types/verdict.type.js";

export interface IClaim extends Document {
  user: IUser | string | IUser | Types.ObjectId;
  claimType: "text" | "url" | "image" | "offline";
  content: string;
  language: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    rawClaims: any[];
    claimReview: any[];
    sources: any[];
    accuracy: number;
    verdict: string;
  };
  createdAt: Date;
  updatedAt: Date;
  claimReview?: IClaimReview;
}

export interface IClaimReviewPublisher {
  name?: string;
  site?: string;
}

export interface IClaimInput {
  claimType: "text" | "url" | "image" | "offline" | string;
  content: string;
  language?: string;
  userId?: string;

  //uncomment to proceed with other claimTypes
  // metadata?: {
  //   imageAnalysis?: {
  //     ocrText?: string;
  //     similarImahes?: string[];
  //   };
  //   urlAnalysis: {
  //     extractedText?: string;
  //     finalUrl?: string;
  //   };
  // };
}

export interface IVerdictSource {
  name: string;
  url: string;
  rating: string;
  date: string;
  origin?: "google" | "africa-check" | "dubawa" | "factcheckhub";
}

export interface IClaimUpdateInput {
  language?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface IClaimResult {
  claimView: Array<{
    user?: string;
    comment?: string;
    date?: string;
  }>;
  claimReview: {
    publisher: string;
    url: string;
    date: string;
    text: string;
  }[];
  rawClaims: any[];
  accuracy: number;
  verdict:
    | "true"
    | "mostly-true"
    | "half-true"
    | "mostly-false"
    | "false"
    | "pants-fire"
    | "unknown"
    | "unverified"
    | string
    | Verdict;
  sources: IFactCheckSource[];
}

export interface IFactCheckSource {
  publisher: {
    name: string;
    site: string;
  };
  url: string;
  reviewDate: string;
}

export interface IReviewRating {
  ratingValue?: number;
  alternateName?: string;
}

export interface IRawClaim {
  text: string;
  claimant?: string;
  claimDate?: string;
  claimReview?: IClaimReview[];
}

export interface IFactCheckResult {
  rawClaims: IRawClaim[];
  claimReview: Array<{
    publisher: string;
    url: string;
    date: string;
    rating: string;
    text: string;
  }>;
  accuracy: number;
  verdict: Verdict;
  sources: IFactCheckSource[];
  //watch from after this line
  // sources: IVerdictSource | IFactCheckSource[];
  // confidence: number;
  // metadata: {
  //   extractedText?: string;
  //   similarClaims?: Array<{
  //     content: string;
  //     url: string;
  //     rating: string;
  //   }>;
  //   imageAnalysis?: {
  //     ocrText?: string;
  //     ocrConfidence?: number;
  //     similarImages?: string[];
  //   };
  //   urlAnalysis?: {
  //     finalUrl?: string;
  //     title?: string;
  //     excerpt?: string;
  //   };
  // };
  rawApiResponse: IGoogleFactCheckResponse;
}

interface IGoogleFactCheckResponse {
  claims: Array<{
    text: string;
    claimant?: string;
    claimDate?: string;
    claimReview: Array<{
      publisher: {
        name: string;
        site: string;
      };
      url: string;
      title?: string;
      reviewDate?: string;
      textualRating?: string;
      languageCode: string;
    }>;
  }>;
  nextPageToken?: string;
}

export interface IClaimReview {
  publisher?: {
    name: string;
    site?: string;
  };
  url?: string;
  title?: string;
  reviewDate?: string;
  textualRating?: string;
  languageCode?: string;
  reviewRating?: IReviewRating;
}
