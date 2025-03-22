import path from 'path';

// Define the CSV file path
const CSV_PATH = path.resolve('resources/database/accounts.csv');

// Function to create an account
async function createAccount(username, password, email, admin, verified) {
    // TODO: Implement the account creation logic.
    // For example:
    // - Validate input.
    // - Hash the password.
    // - Write the account details to your database or CSV file.
    // - Handle error cases.
    console.log(`Creating account with:
      Username: ${username}
      Password: ${password}
      Email: ${email}
      Admin: ${admin}
      Verified: ${verified}`);
    // Placeholder: return success status.
    return 0;
  }


// Command-line interface: process arguments if this module is run directly.
if (require.main === module) {
    // Expected usage:
    // node register.js createAccount <username> <password> <email> <admin> <verified>
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error("No command provided.");
      process.exit(1);
    }
    
    const command = args[0];
    
    if (command === 'createAccount') {
      if (args.length !== 6) {
        console.error("Usage: createAccount <username> <password> <email> <admin> <verified>");
        process.exit(1);
      }
      
      const [username, password, email, admin, verified] = args.slice(1);
      
      createAccount(username, password, email, admin, verified)
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

export { createAccount };

// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { db } from '../../database/connection.js';
// import { sendVerificationEmail } from './emailService.js';

// const router = express.Router();
// const saltRounds = 10;
// // const JWT_SECRET = 'secret-key';  

// router.post('/register', async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         if (!username || !email || !password) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         const userExists = await db.get('SELECT * FROM UserAccount WHERE username = ? OR email = ?', [username, email]);
//         if (userExists) {
//             return res.status(400).json({ message: 'Username or Email already in use' });
//         }

//         const passwordHash = await bcrypt.hash(password, saltRounds);

//         const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

//         await db.run(
//             `INSERT INTO UserAccount (username, email, passwordHash, isVerified, date_created)
//              VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)`,
//             [username, email, passwordHash]
//         );

//         await sendVerificationEmail(email, verificationToken);

//         res.status(201).json({ message: 'User registered. Please check your email for verification.' });
//     } catch (error) {
//         console.error('Error in registration:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// export default router;
