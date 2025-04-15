import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { userValidationRules, validate, } from "../middleware/validation.middleware.js";
import { asyncHandler } from "../utils/apiFeatures.js";
const router = Router();
router.post("/signup", userValidationRules(), validate, userController.signup);
router.post("/login", userController.login);
//protected routes
router.use(asyncHandler(protect));
router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
// export const userRoutes = router;
export default router;
