import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js"; // Import the Job model to fetch custom questions
import { uploadFile } from "../utils/fileUpload.js"; // Utility for handling file uploads

// Create a new job application
export const createJobApplication = async (req, res) => {
    try {
        const { jobId, firstName, lastName, email, coverLetter, customQuestionsAnswers } = req.body;
        const resumeFile = req.file; // Resume file from multer or similar middleware

        // Validate required fields
        if (!jobId || !firstName || !lastName || !email || !resumeFile) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Fetch the job to check for custom questions
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if the candidate has already applied for this job
        const existingApplication = await JobApplication.findOne({ email, jobId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job." });
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

        // Upload resume file and get the file path
        const resumePath = await uploadFile(resumeFile);

        // Create the job application
        const jobApplication = new JobApplication({
            jobId,
            resume: resumePath,
            coverLetter,
            firstName,
            lastName,
            email,
            customQuestionsAnswers,
        });

        await jobApplication.save();

        res.status(201).json({ message: "Job application submitted successfully", jobApplication });
    } catch (error) {
        console.error("Error creating job application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all job applications for a specific job (for HR/admin)
export const getJobApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Fetch job applications for the specified job
        const jobApplications = await JobApplication.find({ jobId });

        res.status(200).json(jobApplications);
    } catch (error) {
        console.error("Error fetching job applications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific job application by ID
export const getJobApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Fetch the job application
        const jobApplication = await JobApplication.findById(applicationId);

        if (!jobApplication) {
            return res.status(404).json({ message: "Job application not found" });
        }

        res.status(200).json(jobApplication);
    } catch (error) {
        console.error("Error fetching job application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update the status of a job application (for HR/admin)
export const updateJobApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ["Pending", "Reviewed", "Accepted", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Update the job application
        const updatedApplication = await JobApplication.findByIdAndUpdate(
            applicationId,
            { status, notes },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: "Job application not found" });
        }

        res.status(200).json({ message: "Job application updated successfully", updatedApplication });
    } catch (error) {
        console.error("Error updating job application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};