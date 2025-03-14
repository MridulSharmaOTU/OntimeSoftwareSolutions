import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../database/connection.js';
import { sendVerificationEmail } from './emailService.js';

const router = express.Router();
const saltRounds = 10;
// const JWT_SECRET = 'secret-key';  

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userExists = await db.get('SELECT * FROM UserAccount WHERE username = ? OR email = ?', [username, email]);
        if (userExists) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);

        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

        await db.run(
            `INSERT INTO UserAccount (username, email, passwordHash, isVerified, date_created)
             VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [username, email, passwordHash]
        );

        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
