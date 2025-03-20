import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js"; // Import job applications API

dotenv.config();
const app = express();

// ✅ Enable CORS for frontend requests
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/job-applications", jobApplicationRoutes); // Register Job Application API

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB Connection Error:", err));
