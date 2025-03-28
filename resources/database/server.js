// server.js in resources/database (ES Module version)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Use memory storage for file uploads.
const upload = multer({ storage: multer.memoryStorage() });

// Import our CSV functions from editMetadata.js
import { addGame, editGame, deleteGame, editImages } from "../scripts/editMetadata.js";

// Import the function to load metadata games from loadMetadata.js
import { loadMetadataGames } from "../scripts/loadMetadata.js";

// Set __filename and __dirname in ES module style.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000; // Choose a port that doesn't conflict with your Maven/Jetty server

// Enable CORS so your admin panel (served on a different port) can make requests.
app.use(cors());
// Parse JSON bodies.
app.use(bodyParser.json());

// Path to the CSV file (assumes metadataGames.csv is in the same folder as server.js)
const csvFilePath = path.join(__dirname, "metadataGames.csv");

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});