import { Router } from "express";
import userRoutes from "./user.routes.js";
import claimRoutes from "./claim.routes.js";
const router = Router();
router.post("/test", (req, res) => {
    res.send("Test POST route works!");
});
router.use("/claims", claimRoutes);
router.use("/users", userRoutes);
//health check
router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "Success!",
        message: "Server is running smoothly! 🎉",
    });
});
export const mainRoute = router;
