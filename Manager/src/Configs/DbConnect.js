import mongoose from "mongoose";

export const dbConnect = async (params) => {
    try {
        await mongoose.connect(`${process.env.NODE_ENV == 'production' ? process.env.PRODUCTION_DB_URI : process.env.DEVLOPMENT_DB_URI}`, {
            authSource: 'admin'
        })
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    }
}

