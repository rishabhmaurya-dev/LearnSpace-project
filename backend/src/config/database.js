import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// MOGODB CONNECTION //
//====================


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;