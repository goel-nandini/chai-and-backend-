import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
});


import connectDB from "./db/index.js";
import { app } from "./app.js";
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