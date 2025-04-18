// import { IClaimResult } from "./../interfaces/claim.interface";
import Claim from "../model/claim.model.js";
import {
  IClaim,
  IClaimInput,
  IClaimResult,
  IClaimUpdateInput,
  IFactCheckResult,
  IFactCheckSource,
} from "../interfaces/claim.interface.js";
import factcheckService from "./factcheck.service.js";
import { FilterQuery, QueryOptions } from "mongoose";
import AppError from "../utils/appError.js";
import { Types } from "mongoose";

class ClaimService {  async createClaim(claimData: IClaimInput, userId: string): Promise<IClaim> {
    try {
      const claim = await Claim.create({
        user: userId,
        ...claimData,
        status: "processing",
      });

      const result = await factcheckService.checkClaim(claimData);

      const updatedClaim = await Claim.findByIdAndUpdate(
        claim._id,
        {
          status: "completed",
          result: {
            ...result,
            completedAt: new Date(),
          },
        },
        { new: true }
      );

      console.log(
        JSON.stringify(updatedClaim?.result, null, 2)
      );

      if (!updatedClaim) {
        throw new Error("Failed to update claim");
      }

      return updatedClaim;
    } catch (error) {
      console.error("❌ Claim processing failed:", error);
      throw error;
    }
  }

  //get claim by id
  async getClaimById(
    claimId: string,
    populateUser: boolean = false
  ): Promise<IClaim | null> {
    try {
      let query = Claim.findById(claimId);

      if (populateUser) {
        query = query.populate("user", "name", "email");
      }

      return await query.exec();
    } catch (err) {
      throw new AppError("Error fatching claim", 500);
    }
  }

  //get claims with filtering, sorting and pagination
  async getClaims(
    filter: FilterQuery<IClaim> = {},
    options: QueryOptions = {}
  ): Promise<IClaim[]> {
    try {
      const {
        sortBy = "-createdAt",
        limit = 100,
        page = 1,
        populateUser = false,
      } = options;

      let query = Claim.find(filter)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit);

      if (populateUser) {
        query = query.populate("user", "name email");
      }

      return await query.exec();
    } catch (err) {
      throw new AppError("Error fetching claims", 500);
    }
  }

  //get claims for a specific user
  async getUserClaims(
    userId: string,
    options: QueryOptions = {}
  ): Promise<IClaim[]> {
    return this.getClaims({ user: userId, options });
  }

  //upadate a claim's metadata (does not process the content)
  async updateClaim(
    claimId: string,
    updateData: IClaimUpdateInput
  ): Promise<IClaim | null> {
    try {
      const updateClaim = await Claim.findByIdAndUpdate(claimId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updateClaim) {
        throw new AppError("Claim not found", 404);
      }

      return updateClaim;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Error updating claim", 500);
    }
  }

  //delete a claim
  async deleteClaim(claimId: string): Promise<void> {
    try {
      const result = await Claim.findByIdAndDelete(claimId);

      if (!result) {
        throw new AppError("Claim not found", 404);
      }
    } catch (err) {
      if (err instanceof AppError)
        throw new AppError("Error deleting claim", 500);
    }
  }

  //Re-process a claim  (force new factcheck)
  async reprocessClaim(claimId: string): Promise<IClaim | null> {
    try {
      const claim = await Claim.findById(claimId);

      if (!claim) {
        throw new AppError("Claim not found", 404);
      }

      // Perform fact-check
      const result = await factcheckService.checkClaim({
        claimType: claim.claimType,
        content: claim.content,
        language: claim.language,
      });

      // Update claim with new results - remove claimView reference
      const updatedClaim = await Claim.findByIdAndUpdate(
        claimId,
        {
          $set: {
            status: "completed",
            result: {
              ...result,
            },
          },
        },
        { new: true }
      );

      return updatedClaim;
    } catch (err) {
      await Claim.findByIdAndUpdate(claimId, {
        status: "failed",
        $push: {
          processingErrors:
            err instanceof Error ? err.message : "Reprocessing error",
        },
      });

      throw new AppError("Error re-processing claim", 500);
    }
  }
}

export default new ClaimService();
