import path from 'path';

// Define the CSV file path
const CSV_PATH = path.resolve('resources/database/accounts.csv');

function verifyEmail(username) {
    // TODO: Implement the email verification logic.
    // For example:
    // - Look up the account by username.
    // - Change the account's verified status.
    // - Handle error cases. Ex. account not found, account already verified, etc.
    console.log(`Verifying email for account with username: ${username}`);
    // Placeholder: return success status.
    return 0;
}

// Command-line interface: process arguments if this module is run directly.
if (require.main === module) {
    // Expected usage:
    // node verifyEmail.js verifyEmail <username>
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error("No command provided.");
        process.exit(1);
    }

    const command = args[0];

    if (command === 'verifyEmail') {
        if (args.length !== 2) {
            console.error("Usage: verifyEmail <username>");
            process.exit(1);
        }

        const [username] = args.slice(1);

        verifyEmail(username)
            .then((result) => {
                process.exit(result);
            })
            .catch((err) => {
                console.error("Error:", err);
                process.exit(1);
            });
    } else {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
}
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { db } from '../../database/connection.js';

// const router = express.Router();
// // const JWT_SECRET = 'your-secret-key'; 

// router.get('/verify', async (req, res) => {
//     try {
//         const { token } = req.query;

//         if (!token) {
//             return res.status(400).json({ message: 'Verification token is required' });
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         const email = decoded.email;

//         const user = await db.get('SELECT * FROM UserAccount WHERE email = ?', [email]);
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid verification token' });
//         }

//         await db.run('UPDATE UserAccount SET isVerified = 1 WHERE email = ?', [email]);

//         res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
//     } catch (error) {
//         console.error('Verification error:', error);
//         res.status(500).json({ message: 'Invalid or expired token' });
//     }
// });

// export default router;