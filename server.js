import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS
import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();
const app = express();

// ✅ Enable CORS for frontend requests
app.use(cors({
    origin: "http://localhost:3000", // Allow React frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true // If using cookies or authentication headers
}));

app.use(express.json());
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected...");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));
