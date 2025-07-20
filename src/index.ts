import express, { Request, Response } from "express";
const app = express();
import dotenv from "dotenv";
import connectDb from "./db/db";
import cors from "cors";

//imported routes
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes"

dotenv.config();
connectDb();

app.use(cors());
app.use(express.json());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/contents", contentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API is running with TypeScript...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 