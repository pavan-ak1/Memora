"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the environment variable");
        }
        // Debug: Print the URI (hide sensitive parts)
        const uri = process.env.MONGO_URI;
        const maskedUri = uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@.*)/, '$1***$2');
        console.log("Attempting to connect to MongoDB with URI:", maskedUri);
        const connect = await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("MongoDb connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        console.log("Server will continue running without database connection");
    }
};
exports.default = connectDb;
