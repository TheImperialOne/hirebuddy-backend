import express from "express";
import { authenticate } from "../middleware/authMiddleware.js"; // Import authentication middleware
import { createCandidate, getCandidateByEmail } from "../controllers/candidateController.js";

const router = express.Router();

// Route to create a new candidate
router.post("/", createCandidate);

// Route to get candidate details by email (protected by authentication middleware)
router.get("/me", authenticate, getCandidateByEmail);

export default router;