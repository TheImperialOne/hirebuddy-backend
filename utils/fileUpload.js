import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Filebase credentials and configuration (Directly defined)
const FILEBASE_ACCESS_KEY_ID=B5E83AB22FD7BF704F72
const FILEBASE_SECRET_ACCESS_KEY=Kb3f9XTFUfNrlcxNS6UGqWiNUJNDKrBqxwf1pn9i
const FILEBASE_BUCKET_NAME=hirebuddy-resumes
const FILEBASE_REGION=ap-south-1
const FILEBASE_ENDPOINT = "https://s3.filebase.com";

// Configure S3 client for Filebase
const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: FILEBASE_ENDPOINT,
    credentials: {
        accessKeyId: FILEBASE_ACCESS_KEY_ID,
        secretAccessKey: FILEBASE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

// Multer configuration (memory storage)
const storage = multer.memoryStorage();

// File filter to allow only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed."), false);
    }
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Function to upload file to Filebase
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

export { upload, uploadFileToFilebase };
