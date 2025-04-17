import { asyncHandler } from "./../utils/apiFeatures.js";
import { Router } from "express";
import claimController from "../controllers/claim.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { claimValidationRules, validate, } from "../middleware/validation.middleware.js";
const router = Router();
// Protect all routes after this middleware
router.use(asyncHandler(protect));
// Claim creation with validation
router.post("/", claimValidationRules(), validate, claimController.createClaim);
// User-specific claims
router.get("/my-claims", claimController.getMyClaims);
// Admin-only routes
router.use(restrictTo("admin"));
router.route("/").get(claimController.getClaims);
router
    .route("/:id")
    .get(claimController.getClaim)
    .patch(claimController.updateClaim)
    .delete(claimController.deleteClaim);
router.post("/:id/reprocess", claimController.reprocessClaim);
export default router;
