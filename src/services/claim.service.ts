import Claim from "../model/claim.model.js";
import {
  IClaim,
  IClaimInput,
  IClaimUpdateInput,
} from "../interfaces/claim.interface.js";
import factcheckService from "./factcheck.service.js";
import { FilterQuery, QueryOptions } from "mongoose";
import AppError from "../utils/appError.js";
import { Types } from "mongoose";

class ClaimService {
  //create a new claim and initiate factchecking
  async createClaim(claimData: IClaimInput, userId: string): Promise<IClaim> {
    try {
      const claim = new Claim({
        user: userId,
        ...claimData,
        status: "pending",
        language: claimData.language || "en",
      });

      await claim.save();

      //process claim in the background without awaiting
      this.processClaim((claim._id as Types.ObjectId).toString()).catch(
        console.error
      );

      return claim;
    } catch (err) {
      console.error("Error creating claim: ", err);
      throw new AppError("Failed to create claim", 500);
    }
  }

  //process claim via the factchecking pipeline
  private async processClaim(claimId: string): Promise<void> {
    try {
      const claim = await Claim.findById(claimId);

      //check for claim
      if (!claim) throw new Error("Claim not found!😞");

      //update status to processing
      claim.status = "processing";
      await claim.save();

      //get the result from fact check service
      const result = await factcheckService.checkClaim({
        claimType: claim.claimType,
        content: claim.content,
        language: claim.language,
      });

      //update claim with result
      claim.result = result;
      (claim.status = "completed"), await claim.save();
    } catch (err) {
      console.error(`Claim processing error for ID ${claimId}:`, err);

      await Claim.findByIdAndUpdate(claimId, {
        status: "failed",
        $push: {
          processingErrors:
            err instanceof Error ? err.message : "Unknown error",
        },
      });
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
        query = query.populate("user", "name", "email");
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
      //avoid updating fields that will require re-processing
      // const { content, claimType, ...safeUpdates } = updateData;

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
      const claim = await Claim.findByIdAndUpdate(claimId, { new: true });

      if (!claim) {
        throw new AppError("Claim not found", 404);
      }

      this.processClaim((claim._id as Types.ObjectId).toString()).catch(
        console.error
      );

      return claim;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("Error re-processing claim", 500);
      // Or if you want to handle it differently, you could do this if you like:
      // console.error("Error re-processing claim:", err);
      // return null;
    }
  }
}

export default new ClaimService();
