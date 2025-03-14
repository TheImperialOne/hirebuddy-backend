// controllers/candidateController.js
import Candidate from "../models/Candidate.js";  // Import the Candidate model
import { getAuth } from "firebase-admin/auth";

// Create a new candidate using data from Firebase
const createCandidate = async (req, res) => {
    console.log("Received request:", req.body);

    // Extract Firebase UID from the request user (which was added by the verifyFirebaseToken middleware)
    const { uid, email } = req.user;

    // Assuming firstName, lastName are in the request body
    const { firstName, lastName } = req.body;

    try {
        // Check if the candidate already exists
        const existingCandidate = await Candidate.findOne({ firebaseUID: uid });
        if (existingCandidate) {
            return res.status(400).json({ message: "Candidate already exists" });
        }

        // Create new candidate
        const newCandidate = new Candidate({
            firebaseUID: uid,
            firstName,
            lastName,
            email,
        });

        await newCandidate.save();

        res.status(201).send({
            message: "Candidate created successfully",
            candidate: newCandidate,
        });
    } catch (err) {
        res.status(400).send({
            message: "Error creating candidate",
            error: err.message,
        });
    }
};

// Get the current logged-in candidate based on Firebase UID
const getCandidateByUID = async (req, res) => {
    try {
        const candidate = await Candidate.findOne({ firebaseUID: req.user.uid });
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json(candidate);
    } catch (err) {
        res.status(400).send({
            message: "Error fetching candidate",
            error: err.message,
        });
    }
};

export { createCandidate, getCandidateByUID };
