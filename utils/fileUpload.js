import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/resumes"; // Directory to store uploaded resumes
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for the uploaded file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, `resume-${uniqueSuffix}${ext}`);
    },
});

// File filter to allow only specific file types (e.g., PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed."), false);
    }
};

// Configure multer with storage and file filter
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
});

// Utility function to handle file upload
const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
        } else {
            resolve(file.path); // Return the file path
        }
    });
};

export { upload, uploadFile };