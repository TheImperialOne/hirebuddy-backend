import Candidate from "../models/Candidate.js";

// Create a new candidate
export const createCandidate = async (req, res) => {
    console.log("Received request:", req.body);

    const { firstName, lastName, email } = req.body;

    try {
        // Check if the candidate already exists
        const existingCandidate = await Candidate.findOne({ email });
        if (existingCandidate) {
            return res.status(400).json({ message: "Candidate already exists" });
        }

        // Create new candidate
        const newCandidate = new Candidate({
            firstName,
            lastName,
            email,
        });

        await newCandidate.save();

        res.status(201).json({
            message: "Candidate created successfully",
            candidate: newCandidate,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error creating candidate",
            error: err.message,
        });
    }
};

// Get the current logged-in candidate based on email
export const getCandidateByEmail = async (req, res) => {
    try {
        const { email } = req.query; // Extract email from query parameters
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        const candidate = await Candidate.findOne({ email });
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json(candidate);
    } catch (error) {
        res.status(500).json({ message: "Error fetching candidate", error: error.message });
    }
};