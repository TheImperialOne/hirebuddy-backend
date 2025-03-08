import express from "express";
import Job from "../models/Job.js"; // Import Job model using ES Modules

const router = express.Router();

// 🟢 Create a Job
router.post("/", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔵 Get All Jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 }); // Fetch latest jobs first
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🔵 Get a Single Job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 🟡 Update a Job
router.put("/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔴 Delete a Job
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; // ✅ Export using ES Modules
