import Candidate from "../models/Candidate.js";  // Import the Candidate model

// Create a new candidate
const createCandidate = async (req, res) => {
    console.log("Received request:", req.body);

    // Extract data from the request body
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

// Get the current logged-in candidate based on email
const getCandidateByEmail = async (req, res) => {
    try {
        const { email } = req.user; // Assuming email is passed in the request user object
        const candidate = await Candidate.findOne({ email });
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

export { createCandidate, getCandidateByEmail };