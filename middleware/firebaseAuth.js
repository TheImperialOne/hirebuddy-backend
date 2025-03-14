// middleware/firebaseAuth.js
import { getAuth } from 'firebase-admin/auth';

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split(' ')[1];  // Extract token from Authorization header

    if (!idToken) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        req.user = decodedToken;  // Add decoded user info to the request
        next();  // Proceed to next middleware or route handler
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
