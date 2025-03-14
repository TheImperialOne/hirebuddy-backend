import mongoose from "mongoose";  // Use ES import instead of require

// Define the Candidate schema
const candidateSchema = new mongoose.Schema(
    {
        firebaseUID: { type: String, unique: true, required: true },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create the Candidate model
const Candidate = mongoose.model("Candidate", candidateSchema);

// Export the Candidate model as the default export
export default Candidate;
