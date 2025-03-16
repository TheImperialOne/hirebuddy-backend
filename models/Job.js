import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        pay: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
            currency: { type: String, default: "INR" },
        },
        jobType: { type: [String], required: true }, // ["Full-time", "Permanent"]
        shift: { type: String, default: "Day shift" },
        description: { type: String, required: true },
        keySkills: { type: [String], required: true },
        requirements: { type: [String], required: true },
        additionalInfo: {
            education: { type: String, default: "Bachelor's (Preferred)" },
            experience: { type: String, default: "1 year (Preferred)" },
        },
        benefits: { type: [String] }, // Example: ["Performance bonus", "Yearly bonus"]
        postedAt: { type: Date, default: Date.now },
        customQuestions: [
            {
                question: { type: String, required: true },
                required: { type: Boolean, default: true },
            },
        ],
    },
    { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
