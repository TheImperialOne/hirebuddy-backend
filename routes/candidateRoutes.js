import { createCandidate, getCandidateByEmail } from "../controllers/candidateController.js";
import express from "express";

const router = express.Router();

// Route to create a new candidate
router.post("/", createCandidate);

// Route to get candidate details by email
router.get("/", getCandidateByEmail); // Updated route to match `/api/candidates?email=...`

export default router;