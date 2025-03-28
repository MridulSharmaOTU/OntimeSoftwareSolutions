// server.js in resources/database
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Import functions from editMetadata.js (which is in resources/scripts)
const { addGame, editGame, deleteGame } = require("../scripts/editMetadata.js");

// Create Express app
const app = express();
const PORT = 3000; // Use a port distinct from your admin panel

// Enable CORS so that our admin panel (served on a different port) can call the API.
app.use(cors());
// Parse JSON request bodies.
app.use(bodyParser.json());

// Path to the CSV file (assuming metadataGames.csv is in this folder)
const csvFilePath = path.join(__dirname, "metadataGames.csv");

/**
 * GET /data
 * Reads the CSV file and returns its contents as JSON.
 */
app.get("/data", async (req, res) => {
  try {
    // We use the loadMetadataGames() function from editMetadata.js indirectly via its dependency.
    // For simplicity, here we read the CSV file manually.
    const fs = require("fs");
    const csvText = await fs.promises.readFile(csvFilePath, "utf8");
    // For parsing CSV, we can use a simple approach or csv-parser.
    // Here, we assume the CSV has a header row and simple comma-separated values.
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");
    const data = lines.slice(1).map(line => {
      const values = line.split(",");
      const record = {};
      headers.forEach((header, i) => {
        record[header.trim()] = values[i] ? values[i].trim() : "";
      });
      return record;
    });
    res.json(data);
  } catch (error) {
    console.error("Error reading CSV:", error);
    res.status(500).send("Error reading CSV file.");
  }
});

/**
 * POST /data
 * Adds a new game by calling addGame() from editMetadata.js.
 * Expects a JSON body with the new game data.
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
 * Edits an existing game by calling editGame() from editMetadata.js.
 * Expects a JSON body with the game data including the "ID" field.
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
 * Deletes a game by calling deleteGame() from editMetadata.js.
 * Expects a JSON body with the field "id" (the game ID).
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

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});