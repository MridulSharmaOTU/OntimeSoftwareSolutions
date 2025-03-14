import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../database/connection.js';

const router = express.Router();
// const JWT_SECRET = 'your-secret-key'; 

router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        const user = await db.get('SELECT * FROM UserAccount WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        await db.run('UPDATE UserAccount SET isVerified = 1 WHERE email = ?', [email]);

        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Invalid or expired token' });
    }
});

export default router;
