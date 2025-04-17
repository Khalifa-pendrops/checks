import { Request, Response, NextFunction } from "express";
import claimService from "../services/claim.service.js";
import { asyncHandler } from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import { IClaimInput } from "../interfaces/claim.interface.js";
import { AuthenticatedRequest } from "../types/custom.js";

class ClaimController {
  //create a claim
  //access is private
  createClaim = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const claimData: IClaimInput = {
          claimType: req.body.claimType,
          content: req.body.content,
          language: req.body.language || req.user.languagePreference || "en",
        };

        const claim = await claimService.createClaim(claimData, req.user._id);
        res.status(201).json({
          status: "Success 🎉",
          message: "Claim created successfully ✅",
          data: {
            claim,
          },
        });
      } catch (err: any) {
        res.status(500).json({
          status: "Failed",
          message: "Failed to create claim",
        });
        console.error("Failed to create claim:", err.message);
      }
    }
  );

  // claim.controller.ts
  // createClaim = asyncHandler(
  //   async (req: AuthenticatedRequest, res: Response) => {
  //     const claimData: IClaimInput = {
  //       claimType: req.body.claimType,
  //       content: req.body.content,
  //       language: req.body.language || req.user.languagePreference || "en",
  //     };

  //     const claim = await claimService.createClaim(claimData, req.user._id);

  //     if (!claim?.result) {
  //       throw new AppError("Fact-check processing failed", 500);
  //     }

  //     res.status(201).json({
  //       status: "Success 🎉",
  //       message: "Claim created and fact-checked ✅",
  //       data: {
  //         claim: {
  //           ...claim.toObject(),
  //           result: claim.result, // Ensured to exist
  //         },
  //       },
  //     });
  //   }
  // );

  // In claim.controller.ts
  // createClaim = asyncHandler(
  //   async (req: AuthenticatedRequest, res: Response) => {
  //     const claimData: IClaimInput = {
  //       ...req.body,
  //       user: req.user._id,
  //       status: "pending",
  //     };

  //     // 1. First create the claim in database
  //     const newClaim = await claimService.createClaim(claimData);

  //     // 2. Then initiate fact-check (await the results)
  //     const factCheckResults = await factCheckService.checkClaim(claimData);

  //     // 3. Update claim with results
  //     const updatedClaim = await claimService.updateClaim(newClaim._id, {
  //       status: "processed",
  //       result: factCheckResults,
  //     });

  //     res.status(201).json({
  //       status: "Success 🎉",
  //       message: "Claim created and processed ✅",
  //       data: {
  //         claim: updatedClaim, // Includes fact-check results
  //       },
  //     });
  //   }
  // );

  //get all claims (with filtering)
  //access is private/admin
  getClaims = asyncHandler(async (req: Request, res: Response) => {
    try {
      //filtering
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.claimType) filter.claimType = req.query.claimType;
      if (req.query.language) filter.langauge = req.query.language;

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
