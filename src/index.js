import dotenv from "dotenv";
dotenv.config();
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
import express from "express";
import connectDB from "./db/index.js";

const app = express();

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("ERROR:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });