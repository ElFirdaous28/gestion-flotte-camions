import jwt from 'jsonwebtoken';
import config from '../config/config.js';
const JWT_SECRET = config.JWT_SECRET;

// Check if the user is logged in
export const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded; // contains { id, role, iat, exp }

        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default isAuthenticated;