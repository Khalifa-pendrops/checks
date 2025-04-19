import { Router } from "express";
import languageController from "../controllers/language.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { languageValidationRules, validate, } from "../middleware/validation.middleware.js";
import { asyncHandler } from "../utils/apiFeatures.js";
const router = Router();
router.get("/", languageController.getLanguage);
router.get("/nigerian", languageController.getNigerianLanguages);
//protected routes
router.use(asyncHandler(protect));
router.use(restrictTo("admin"));
router
    .route("/")
    .post(languageValidationRules(), validate, languageController.createLangauge);
router
    .route("/:code")
    .patch(languageValidationRules(), validate, languageController.updateLanguage);
export default router;
