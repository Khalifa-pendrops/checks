import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { mainRoute } from "./routes/index.js";
import errorMidddleware from "./middleware/error.middleware.js";
const app = express();
//middleswares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
// Routes go here
app.use("/api/v1", mainRoute);
//Error handling middleware go here
app.use(errorMidddleware);
export default app;
