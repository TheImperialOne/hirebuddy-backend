import express from "express";
import multer from "multer";
import path from "path"; // Import the path module
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js"; // Import Job model to fetch custom questions

const router = express.Router();

// Configure AWS S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION, // e.g., 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 📂 Multer Configuration for Memory Storage
const storage = multer.memoryStorage(); // Store files in memory instead of disk

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

// Utility function to upload file to S3
const uploadFileToS3 = async (file) => {
    if (!file) {
        throw new Error("No file provided");
    }

    const key = `resumes/${Date.now()}-${file.originalname}`; // S3 object key (e.g., 'resumes/resume-123456789.pdf')

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // Your S3 bucket name
        Key: key,
        Body: file.buffer, // Use file.buffer from memory storage
        ContentType: file.mimetype, // Set the content type (e.g., 'application/pdf')
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command); // Upload the file to S3
        const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`; // Generate the S3 file URL
        return fileUrl; // Return the S3 file URL
    } catch (err) {
        console.error("Error uploading file to S3:", err);
        throw err;
    }
};

// 🟢 Apply for a job
router.post("/apply", upload.single("resume"), async (req, res) => {
    try {
        const { jobId, firstName, lastName, email, coverLetter, customQuestionsAnswers } = req.body;

        // Check if required fields are present
        if (!jobId || !firstName || !lastName || !email) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Ensure resume is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Resume is required." });
        }

        // Fetch the job to validate custom questions
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Validate custom questions (if any)
        if (job.customQuestions && job.customQuestions.length > 0) {
            const requiredQuestions = job.customQuestions.filter((q) => q.required);
            for (const question of requiredQuestions) {
                if (!customQuestionsAnswers || !customQuestionsAnswers[question.question]) {
                    return res.status(400).json({
                        message: `Missing answer for required question: ${question.question}`,
                    });
                }
            }
        }

        // Upload the resume to S3
        const resumeUrl = await uploadFileToS3(req.file);

        // Create a new job application
        const newApplication = new JobApplication({
            jobId,
            firstName,
            lastName,
            email,
            resume: resumeUrl, // Store S3 file URL
            coverLetter,
            customQuestionsAnswers: new Map(Object.entries(customQuestionsAnswers || {})), // Convert to Map
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
        const applications = await JobApplication.find().populate("jobId", "title company");

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// 🟢 Get a specific job application
router.get("/:id", async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id).populate("jobId", "title company");

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