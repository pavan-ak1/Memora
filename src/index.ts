import express from "express";
const app = express();

//routes
import authRoutes from "./routes/authRoutes"

app.use("/api/v1/",authRoutes);

