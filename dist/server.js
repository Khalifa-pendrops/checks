import app from "./app.js";
import mongoose from "mongoose";
import config from "./config/index.config.js";
const { port, database_url } = config;
//DB
mongoose
    .connect(database_url)
    .then(() => console.log("🎉 MongoDB Database connected succesffully!"))
    .catch((err) => console.log("⛔ Database connection error: ", err));
//server!
const server = app.listen(port, () => {
    console.log(`🎉 Server running on port ${port}`);
});
process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection! Shutting down...");
    console.log(error.name, error.message);
    server.close(() => {
        process.exit(1);
    });
});
