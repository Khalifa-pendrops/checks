import mongoose from "mongoose";
import { IClaim } from "../interfaces/claim.interface.js";
import { ref } from "process";
import { timeStamp } from "console";

const claimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    claimType: {
      type: String,
      enum: ["text", "url", "image", "offline"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
      default: "en",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    result: {
      claimReview: { type: Array, dafault: [] },
      accuracy: { type: Number, min: 0, max: 100 },
      verdict: {
        type: String,
        enum: [
          "true",
          "mostly-true",
          "half-true",
          "mostly-false",
          "false",
          "pants-fire",
          "unknown",
        ],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IClaim>("Claim", claimSchema);
