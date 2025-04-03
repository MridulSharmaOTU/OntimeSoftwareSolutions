// server.js in resources/database (ES Module version)
import cors from "cors";
import express from "express";
import session from 'express-session';
import jwt from "jsonwebtoken"; // This also requires `nodemailer`
import multer from "multer"; // This also requires `sharp`

import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Existing imports for metadata games handling
import { addGame, editGame, deleteGame, editImages } from "../scripts/editMetadata.js";
import { loadMetadataGames } from "../scripts/loadMetadata.js";

// Import account management services
import { createAccount } from "../scripts/accountManagement/register.js";
import { sendVerificationEmail } from "../scripts/accountManagement/emailService.js";
import { verifyAccount } from "../scripts/accountManagement/verifyEmail.js";
import { loginCredentials } from "../scripts/accountManagement/verifyLogin.js";

// Set __filename and __dirname in ES module style.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ABSOLUTE_METADATA_PATH = path.resolve(__dirname, "metadataGames.csv"); // Compute absolute path to metadataGames.csv at startup.

export { ABSOLUTE_METADATA_PATH }; // Export the absolute path for use in other modules.

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your admin panel can make requests.
app.use(cors());
// Parse JSON bodies.
app.use(bodyParser.json());

// Store user sessions in memory (not recommended for production).
// For production, consider using a store like Redis or MongoDB.
app.use(session({
  secret: 'dummy-key-two', // Replace with a strong secret key from an environment variable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Memory storage for file uploads.
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /data
 * Returns the CSV data as JSON.
 */
app.get("/data", async (req, res) => {
  try {
    const data = await loadMetadataGames();
    res.json(data);
  } catch (error) {
    console.error("Error loading CSV data:", error);
    res.status(500).send("Error reading CSV file.");
  }
});

/**
 * POST /data
 * Adds a new game.
 */
app.post("/data", async (req, res) => {
  try {
    const {
      Title,
      DescriptionS,
      DescriptionL,
      "Genre Tags": GenreTags,
      "Release Date": ReleaseDate,
      Platform,
      "Developer/Publisher": DeveloperPublisher,
      Age,
      Rating,
      "Average Completion Time": AverageCompletionTime,
      Trailer
    } = req.body;
    const newGame = await addGame(
      Title,
      DescriptionS,
      GenreTags,
      ReleaseDate,
      Platform,
      DeveloperPublisher,
      Age,
      Rating,
      AverageCompletionTime,
      DescriptionL,
      Trailer
    );
    res.json({ success: true, game: newGame });
  } catch (error) {
    console.error("Error adding game:", error);
    res.status(500).json({ success: false, error: "Failed to add game." });
  }
});

/**
 * PUT /data
 * Edits an existing game.
 */
app.put("/data", async (req, res) => {
  try {
    const {
      ID,
      Title,
      DescriptionS,
      DescriptionL,
      "Genre Tags": GenreTags,
      "Release Date": ReleaseDate,
      Platform,
      "Developer/Publisher": DeveloperPublisher,
      Age,
      Rating,
      "Average Completion Time": AverageCompletionTime,
      Trailer
    } = req.body;
    const updatedGame = await editGame(
      ID,
      Title,
      DescriptionS,
      GenreTags,
      ReleaseDate,
      Platform,
      DeveloperPublisher,
      Age,
      Rating,
      AverageCompletionTime,
      DescriptionL,
      Trailer
    );
    if (updatedGame) {
      res.json({ success: true, game: updatedGame });
    } else {
      res.status(404).json({ success: false, error: "Game not found." });
    }
  } catch (error) {
    console.error("Error editing game:", error);
    res.status(500).json({ success: false, error: "Failed to edit game." });
  }
});

/**
 * DELETE /data
 * Deletes a game.
 */
app.delete("/data", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await deleteGame(id);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Game not found or deletion failed." });
    }
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ success: false, error: "Failed to delete game." });
  }
});

/**
 * POST /images
 * Accepts image uploads and calls editImages() to process them.
 * Expects form-data with field "id" and files for banner, cover, ss1, ss2, and ss3.
 */
app.post("/images", upload.fields([
  { name: "banner", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "ss1", maxCount: 1 },
  { name: "ss2", maxCount: 1 },
  { name: "ss3", maxCount: 1 }
]), async (req, res) => {
  try {
    const id = req.body.id;
    const banner = req.files.banner ? req.files.banner[0].buffer : null;
    const cover = req.files.cover ? req.files.cover[0].buffer : null;
    const ss1 = req.files.ss1 ? req.files.ss1[0].buffer : null;
    const ss2 = req.files.ss2 ? req.files.ss2[0].buffer : null;
    const ss3 = req.files.ss3 ? req.files.ss3[0].buffer : null;
    
    const result = await editImages(id, banner, cover, ss1, ss2, ss3);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: "Image processing failed" });
    }
  } catch (err) {
    console.error("Error in /images endpoint:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/**
 * POST /api/register
 * Endpoint to create a new account and send a verification email.
 */
app.post("/api/register", async (req, res) => {
  try {
    // Extract account details from the request body.
    const { username, email, password, admin = false, verified = false } = req.body;

    // Call the createAccount service to add the new user to accounts.csv.
    await createAccount(username, password, email, admin, verified);

    // Generate a verification token using a dummy secret key. Replace with a key in environment variable for production.
    const token = jwt.sign({ email, username }, "dummy-secret-key", { expiresIn: "24h" });

    // Send the verification email to the user.
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: "Account created. Please check your email for verification." });
  } catch (error) {
    console.error("Error registering account:", error);
    res.status(500).json({ message: "Account registration failed", error: error.toString() });
  }
});

/**
 * POST /api/register
 * Endpoint to create a new account and send a verification email.
 */
app.post("/api/register", async (req, res) => {
  try {
    // Extract account details from the request body.
    const { username, email, password, admin = false, verified = false } = req.body;

    // Call the createAccount service to add the new user to accounts.csv.
    await createAccount(username, password, email, admin, verified);

    // Generate a verification token that includes both email and username.
    const token = jwt.sign({ email, username }, "dummy-secret-key", { expiresIn: "24h" });

    // Send the verification email to the user.
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: "Account created. Please check your email for verification." });
  } catch (error) {
    console.error("Error registering account:", error);
    res.status(500).json({ message: "Account registration failed", error: error.toString() });
  }
});

/**
 * GET /api/verify
 * Endpoint to verify a user's account via a token.
 */
app.get("/api/verify", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send("Verification token is missing.");
  }
  try {
    // Verify the token and extract payload (which now contains username and email)
    const payload = jwt.verify(token, "dummy-secret-key");
    const username = payload.username;
    if (!username) {
      return res.status(400).send("Invalid token payload.");
    }
    // Call verifyAccount() with the username
    await verifyAccount(username);
    res.send("Account verified. You can now log in.");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).send("Invalid or expired token.");
  }
});

/**
 * POST /api/login
 * Endpoint to authenticate a user using their username and password.
 * On success, stores user data in the session so that the user remains logged in.
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await loginCredentials(username, password);
    if (result.success) {
      // Store user data in session, including admin status.
      req.session.user = { username, isAdmin: result.isAdmin };
      res.json({ success: true, message: "Logged in successfully", isAdmin: result.isAdmin });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/**
 * POST /api/logout
 * Endpoint to log a user out by destroying their session.
 * This ensures that the user's session data is cleared and they are effectively logged out.
 */
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});