import express from "express";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js"; // Import Job model to fetch custom questions

const router = express.Router();

// 🔹 Filebase Configuration (Hardcoded Credentials)
const FILEBASE_ACCESS_KEY_ID = "B5E83AB22FD7BF704F72";
const FILEBASE_SECRET_ACCESS_KEY = "Kb3f9XTFUfNrlcxNS6UGqWiNUJNDKrBqxwf1pn9i";
const FILEBASE_BUCKET_NAME = "hirebuddy-resumes";
const FILEBASE_ENDPOINT = "https://s3.filebase.com";

// 🔹 Configure Filebase S3 Client
const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: FILEBASE_ENDPOINT,
    credentials: {
        accessKeyId: FILEBASE_ACCESS_KEY_ID,
        secretAccessKey: FILEBASE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

// 📂 Multer Configuration for Memory Storage
const storage = multer.memoryStorage();

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

// 🔹 Function to Upload File to Filebase
const uploadFileToFilebase = async (file) => {
    if (!file) throw new Error("No file provided");

    const key = `resumes/${Date.now()}-${file.originalname}`;

    const params = {
        Bucket: FILEBASE_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        return `https://${FILEBASE_BUCKET_NAME}.s3.filebase.com/${key}`;
    } catch (err) {
        console.error("Error uploading file to Filebase:", err);
        throw new Error("Failed to upload file to Filebase.");
    }
};

// 🟢 Apply for a Job
router.post("/apply", upload.single("resume"), async (req, res) => {
    try {
        const { jobId, firstName, lastName, email, coverLetter, customQuestionsAnswers, candidateId } = req.body;

        if (!jobId || !firstName || !lastName || !email || !candidateId) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Resume is required." });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

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

        // Upload Resume to Filebase
        const resumeUrl = await uploadFileToFilebase(req.file);

        // Save Job Application
        const newApplication = new JobApplication({
            jobId,
            candidateId, // Include candidateId
            firstName,
            lastName,
            email,
            resume: resumeUrl,
            coverLetter,
            customQuestionsAnswers: new Map(Object.entries(customQuestionsAnswers || {})),
        });

        await newApplication.save();

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
