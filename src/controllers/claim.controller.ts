import { Request, Response, NextFunction } from "express";
import claimService from "../services/claim.service.js";
import { asyncHandler } from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import { IClaimInput, IClaimReview } from "../interfaces/claim.interface.js";
import { AuthenticatedRequest } from "../types/custom.js";

class ClaimController { createClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const claimData = {
        claimType: req.body.claimType,
        content: req.body.content,
        language: req.body.language || req.user.languagePreference || "en",
      };

      console.log("📨 New claim submission:", claimData.content);

      try {
        const claim = await claimService.createClaim(claimData, req.user._id);

        if (!claim.result) {
          console.warn("⚠️ No results in claim object");
          throw new AppError("Fact-check results not available", 500);
        }

        console.log("📊 Claim results:", JSON.stringify(claim.result, null, 2));

        res.status(201).json({
          status: "Success 🎉",
          message: "Claim verified",
          data: {
            fullResult: claim.result,
            metadata: {
              id: claim._id,
              type: claim.claimType,
              originalContent: claim.content,
              status: claim.status,
              verdict: claim.result.verdict,
              accuracy: claim.result.accuracy,
              createdAt: claim.createdAt,
            },
            analysis: {
              explanation: this.getVerdictExplanation(claim.result.verdict),
              confidence: claim.result.accuracy > 0.7 ? "High" : "Medium",
            },
          },
        });
      } catch (error) {
        console.error("💥 Controller error:", error);
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : "Processing failed",
        });
      }
    }
  );

  // Helper method for verdict explanations
  private getVerdictExplanation(verdict: string): string {
    const explanations: Record<string, string> = {
      true: "This claim is accurate and well-supported by evidence",
      "mostly-true": "This claim is mostly accurate but may have minor issues",
      "half-true":
        "This claim is partially accurate but contains significant omissions or exaggerations",
      "mostly-false":
        "This claim contains some truth but is largely inaccurate",
      false: "This claim is not supported by evidence",
      "pants-fire": "This claim is completely false and ridiculous",
    };

    return explanations[verdict] || "This claim requires further verification";
  }

  //get all claims (with filtering)
  //access is private/admin
  getClaims = asyncHandler(async (req: Request, res: Response) => {
    try {
      //filtering
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.claimType) filter.claimType = req.query.claimType;
      if (req.query.language) filter.language = req.query.language;

      //pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      //sorting
      const sort = (req.query.sort as string) || "-createdAt";

      const claims = await claimService.getClaims(filter, {
        sortBy: sort,
        limit,
        page,
        populateUser: true,
      }); 

      res.status(200).json({
        status: "Success 🎉",
        message: "Claims fetched successfully ✅",
        results: claims.length,
        page,
        data: {
          claims,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: "Failed",
        message: "Failed to get claims",
      });
      console.error("Failed to get claims:", err.message);
    }
  });

  //get single claim
  //access is private
  getClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const claim = await claimService.getClaimById(req.params.id, true);

        if (!claim) {
          return next(new AppError("No claim found with tht ID", 404));
        }

        //check authorization
        if (
          req.user.role !== "admin" &&
          claim.user.toString() !== req.user._id
        ) {
          return next(
            new AppError("Not authorized to reprocess this claim", 403)
          );
        }

        res.status(200).json({
          status: "Success 🎉",
          message: "Claim fected successfully ✅",
          data: {
            claim,
          },
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to get claim by ID",
        });
        console.error("Failed to get claim by ID:", err.message);
      }
    }
  );

  //get current user's claims
  //access is private
  getMyClaims = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const claims = await claimService.getUserClaims(req.user._id, {
          sortBy: "-createdAt",
        });

        res.status(200).json({
          status: "Success 🎉",
          message: "User's claim fetched successfully ✅",
          results: claims.length,
          data: {
            claims, 
          },
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to get user's claim",
        });
        console.error("Failed to get user's claim:", err.message);
      }
    }
  );

  //update claim metadata only
  //access is private/admin
  updateClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const claim = await claimService.getClaimById(req.params.id);

        if (!claim) {
          return next(new AppError("No claim found with that ID", 404));
        }

        //check authorization
        if (
          req.user.role !== "admin" &&
          claim.user.toString() !== req.user._id
        ) {
          return next(new AppError("Not authorized to update this claim", 403));
        }

        const updatedClaim = await claimService.updateClaim(req.params.id, {
          language: req.body.language,
        });

        res.status(200).json({
          status: "Success 🎉",
          message: "Claim updated successfully ✅",
          data: {
            updatedClaim,
          },
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to upddate claim",
        });
        console.error("Failed to update claim:", err.message);
      }
    }
  );

  //delete claim
  //access is private/admin
  deleteClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const claim = await claimService.getClaimById(req.params.id);

        if (!claim) {
          return next(new AppError("No claim found!", 404));
        }

        //check authorization
        if (
          req.user.role !== "admin" &&
          claim.user.toString() !== req.user._id
        ) {
          return next(new AppError("Not authorized to delete this claim", 403));
        }

        await claimService.deleteClaim(req.params.id);

        res.status(200).json({
          status: "Success 🎉",
          message: "Claim deleted successfully ✅",
          data: null,
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to delete claim",
        });
        console.error("Failed to delete claim:", err.message);
      }
    }
  );

  //re-process a claim
  //acess is private/admin
  reprocessClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const claim = await claimService.getClaimById(req.params.id);

        if (!claim) {
          return next(new AppError("No claim found with that ID", 404));
        }

        //check authorization
        if (
          req.user.role !== "admin" &&
          claim.user.toString() !== req.user._id
        ) {
          return next(
            new AppError("Not authorized to reprocess this claim", 403)
          );
        }

        const reprocessedClaim = await claimService.reprocessClaim(
          req.params.id
        );

        res.status(200).json({
          status: "Success 🎉",
          message: "Claim re-processed successfully ✅",
          data: {
            claim: reprocessedClaim,
          },
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to re-process claim",
        });
        console.error("Failed to re-process claim:", err.message);
      }
    }
  );
}

export default new ClaimController();
