import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        }, // Reference to the Job collection
        resume: { type: String, required: true }, // Store resume file path
        coverLetter: { type: String, default: "" }, // Optional cover letter
        firstName: { type: String, required: true }, // Candidate's first name
        lastName: { type: String, required: true }, // Candidate's last name
        email: { type: String, required: true, unique: true }, // Candidate's email (unique)
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
            default: "Pending",
        },
        notes: { type: String, default: "" }, // HR can add review comments
        customQuestionsAnswers: {
            type: Map,
            of: String,
            default: {},
        }, // Store answers to custom questions (if any)
    },
    { timestamps: true } // Auto-adds 'createdAt' & 'updatedAt'
);

export default mongoose.model("JobApplication", jobApplicationSchema);