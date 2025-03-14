import express from "express";
import multer from "multer";
import path from "path";
import JobApplication from "../models/JobApplication.js";

const router = express.Router();

// 📂 Multer Configuration for Resume Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resumes/"); // Store resumes in "uploads/resumes/"
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            return cb(new Error("Only .pdf, .doc, and .docx files are allowed!"));
        }
    },
});

// 🟢 Apply for a job
router.post("/apply", upload.single("resume"), async (req, res) => {
    try {
        const { candidateId, jobId, firstName, lastName, email, coverLetter } = req.body;

        // Check if the candidate has already applied
        const existingApplication = await JobApplication.findOne({ candidateId, jobId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        // Ensure resume is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Resume is required." });
        }

        // Create a new job application
        const newApplication = new JobApplication({
            candidateId,
            jobId,
            firstName,
            lastName,
            email,
            resume: req.file.path, // Store file path
            coverLetter,
        });

        await newApplication.save();

        // Simulated Notification (Replace with actual logic)
        console.log(`📢 Notification: Candidate ${firstName} ${lastName} applied for Job ${jobId}`);

        res.status(201).json({ message: "Application submitted successfully.", application: newApplication });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// 🟢 Get all job applications
router.get("/", async (req, res) => {
    try {
        const applications = await JobApplication.find()
            .populate("candidateId", "firstName lastName email")
            .populate("jobId", "title company");

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// 🟢 Get a specific job application
router.get("/:id", async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id)
            .populate("candidateId", "firstName lastName email")
            .populate("jobId", "title company");

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

export default router;
