import Job from "../models/Job.js";
import multer from "multer";

// Setup Multer for Resume Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/"); // Store files in 'uploads/resumes/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// 🟢 Create a Job (With Resume Upload)
export const createJob = async (req, res) => {
  try {
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null; // Get resume file path

    const { firstName, lastName, email, jobDetails } = req.body; // Assuming job details is passed in jobDetails

    const newJob = new Job({
      firstName,
      lastName,
      email,
      jobDetails,
      resume: resumeUrl, // Save resume file path
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔵 Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔵 Get a Single Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟡 Update a Job (With Resume Upload)
export const updateJob = async (req, res) => {
  try {
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null; // Get resume path if uploaded

    const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          resume: resumeUrl || req.body.resume, // Update only if new resume is provided
        },
        { new: true, runValidators: true }
    );

    if (!updatedJob) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔴 Delete a Job
export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
