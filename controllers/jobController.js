import Job from "../models/Job.js";

// 🟢 Create a Job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      pay,
      jobType,
      shift,
      description,
      keySkills,
      requirements,
      additionalInfo,
      benefits,
      customQuestions,
      hrEmail,
    } = req.body;

    const newJob = new Job({
      title,
      company,
      location,
      pay,
      jobType,
      shift,
      description,
      keySkills,
      requirements,
      additionalInfo,
      benefits,
      customQuestions,
      hrEmail,
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

// 🟡 Update a Job
export const updateJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      pay,
      jobType,
      shift,
      description,
      keySkills,
      requirements,
      additionalInfo,
      benefits,
      customQuestions,
      hrEmail,
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        {
          title,
          company,
          location,
          pay,
          jobType,
          shift,
          description,
          keySkills,
          requirements,
          additionalInfo,
          benefits,
          customQuestions,
          hrEmail,
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