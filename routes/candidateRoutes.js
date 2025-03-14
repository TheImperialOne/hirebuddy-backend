// routes/candidateRoutes.js
import { createCandidate, getCandidateByUID } from "../controllers/candidateController.js";
import express from "express";
import { verifyFirebaseToken } from "../middleware/firebaseAuth.js";

const router = express.Router();

// Protected route: Create candidate (requires Firebase token verification)
router.post("/", verifyFirebaseToken, createCandidate);  // Use middleware to verify Firebase ID token

// Protected route: Get current candidate details (requires Firebase token verification)
router.get("/me", verifyFirebaseToken, getCandidateByUID);  // Fetch logged-in candidate info

export default router;
