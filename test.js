import mongoose from "mongoose";

console.log("Connecting...");

try {
    const conn = await mongoose.connect(
        "mongodb+srv://backend:backend@cluster0.toofsfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("Connected!");
    console.log(conn.connection.host);
} catch (err) {
    console.error(err);
}