import express from "express";
import { authenticate } from "../middleware/authMiddleware.js"; // Import authentication middleware
import { createCandidate, getCandidateByEmail, getCandidateByEmailQuery } from "../controllers/candidateController.js";

const router = express.Router();

// Route to create a new candidate
router.post("/", createCandidate);

// Route to get candidate details by email (protected by authentication middleware)
router.get("/me", authenticate, getCandidateByEmail);

// New route to fetch candidate by email (query parameter)
router.get("/", getCandidateByEmailQuery);

export default router;