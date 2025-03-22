import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
        }, // Reference to the Candidate collection
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        }, // Reference to the Job collection
        resume: { type: String, required: true }, // Store resume file path
        coverLetter: { type: String, default: "" }, // Optional cover letter
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

// Virtual field to get the candidate's email from the Candidate model
jobApplicationSchema.virtual("email").get(async function () {
    try {
        const candidate = await mongoose.model("Candidate").findById(this.candidateId);
        return candidate ? candidate.email : null;
    } catch (error) {
        console.error("Error fetching candidate email:", error);
        return null;
    }
});

// Ensure virtual fields are included when converting to JSON
jobApplicationSchema.set("toJSON", { virtuals: true });
jobApplicationSchema.set("toObject", { virtuals: true });

export default mongoose.model("JobApplication", jobApplicationSchema);