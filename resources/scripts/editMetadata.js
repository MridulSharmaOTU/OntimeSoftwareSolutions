import { loadMetadataGames } from './loadMetadata.js';

/**
 * Helper function to convert an array of game objects into a CSV string.
 * It uses the keys of the first object as the header row and wraps cells
 * containing commas in quotes.
 *
 * @param {Array<Object>} data - Array of game objects.
 * @returns {string} - The CSV formatted string.
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      let cell = row[header] || "";
      if (cell.includes(',')) {
        cell = `"${cell}"`;
      }
      return cell;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

/**
 * Saves an array of game objects back to the CSV file.
 *
 * In a Node.js environment, this function dynamically imports fs, path, and url modules,
 * defines __filename and __dirname, computes the correct metadata file path, and writes the CSV.
 * In a browser environment, it logs a warning since direct file access isn't possible.
 *
 * @param {Array<Object>} data - The game objects to be saved.
 * @returns {Promise<void>}
 */
async function saveMetadata(data) {
  if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
    // Node environment: dynamically import Node modules.
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const { ABSOLUTE_METADATA_PATH } = await import('../database/server.js');

    // Since this file is in resources/scripts, go up one level and then into database.
    const metadataPath = ABSOLUTE_METADATA_PATH || /* fallback: */ path.resolve(__dirname, '../database/metadataGames.csv');
    try {
      const csvText = convertToCSV(data);
      await fs.promises.writeFile(metadataPath, csvText, 'utf8');
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  } else {
    // Browser environment: file saving isn't supported.
    console.warn("saveMetadata: Running in browser environment. Skipping file save.");
    return;
  }
}

/**
 * Adds a new game to metadataGames.csv.
 *
 * @param {string} title - The title of the game.
 * @param {string} descriptionS - Short description of the game.
 * @param {string} genreTags - Genre tags for the game.
 * @param {string} releaseDate - Release date of the game.
 * @param {string} platform - Platforms on which the game is available.
 * @param {string} developerPublisher - Developer and publisher info.
 * @param {string} age - Age rating.
 * @param {string} rating - Game rating.
 * @param {string} averageCompletionTime - Average completion time.
 * @param {string} descriptionL - Long description of the game.
 * @param {string} trailer - URL for the trailer.
 * @returns {Promise<Object>} - The newly added game object.
 */
async function addGame(title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer) {
  const games = await loadMetadataGames();

  // Generate a new unique ID by finding the maximum existing ID and adding 1.
  let newId = 1;
  if (games.length > 0) {
    newId = Math.max(...games.map(game => Number(game.ID) || 0)) + 1;
  }

  const newGame = {
    ID: newId.toString(),
    Title: title,
    DescriptionS: descriptionS,
    "Genre Tags": genreTags,
    "Release Date": releaseDate,
    Platform: platform,
    "Developer/Publisher": developerPublisher,
    Age: age,
    Rating: rating,
    "Average Completion Time": averageCompletionTime,
    DescriptionL: descriptionL,
    Trailer: trailer
  };

  games.push(newGame);
  await saveMetadata(games);
  return newGame;
}

/**
 * Edits an existing game in metadataGames.csv.
 * If a field is empty, null, or undefined, it will be skipped.
 *
 * @param {string} id - The ID of the game to edit.
 * @param {string} title - The new title of the game.
 * @param {string} descriptionS - New short description.
 * @param {string} genreTags - New genre tags.
 * @param {string} releaseDate - New release date.
 * @param {string} platform - New platform information.
 * @param {string} developerPublisher - New developer/publisher info.
 * @param {string} age - New age rating.
 * @param {string} rating - New rating.
 * @param {string} averageCompletionTime - New average completion time.
 * @param {string} descriptionL - New long description.
 * @param {string} trailer - New trailer URL.
 * @returns {Promise<Object|null>} - The updated game object, or null if the game was not found.
 */
async function editGame(id, title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer) {
  const games = await loadMetadataGames();
  const index = games.findIndex(game => game.ID === id);

  if (index === -1) {
    console.error(`Game with ID ${id} not found.`);
    return null;
  }

  // Create a copy of the existing game data.
  const updatedGame = { ...games[index] };

  // Update fields only if a non-empty, non-null value is provided.
  if (title != null && title !== '') updatedGame.Title = title;
  if (descriptionS != null && descriptionS !== '') updatedGame.DescriptionS = descriptionS;
  if (genreTags != null && genreTags !== '') updatedGame["Genre Tags"] = genreTags;
  if (releaseDate != null && releaseDate !== '') updatedGame["Release Date"] = releaseDate;
  if (platform != null && platform !== '') updatedGame.Platform = platform;
  if (developerPublisher != null && developerPublisher !== '') updatedGame["Developer/Publisher"] = developerPublisher;
  if (age != null && age !== '') updatedGame.Age = age;
  if (rating != null && rating !== '') updatedGame.Rating = rating;
  if (averageCompletionTime != null && averageCompletionTime !== '') updatedGame["Average Completion Time"] = averageCompletionTime;
  if (descriptionL != null && descriptionL !== '') updatedGame.DescriptionL = descriptionL;
  if (trailer != null && trailer !== '') updatedGame.Trailer = trailer;

  games[index] = updatedGame;
  await saveMetadata(games);
  return games[index];
}

/**
 * Converts provided image inputs to .webp format and saves them into the 
 * `resources/images/games/{id}` folder. Existing files in that folder are overwritten.
 * 
 * @param {number|string} id - The game ID.
 * @param {*} banner - The banner image (Buffer or file path).
 * @param {*} cover - The cover image (Buffer or file path).
 * @param {*} ss1 - The first screenshot (Buffer or file path).
 * @param {*} ss2 - The second screenshot (Buffer or file path).
 * @param {*} ss3 - The third screenshot (Buffer or file path).
 * @returns {Promise<boolean>} - Returns true if the images are processed and saved successfully; otherwise false.
 */
async function editImages(id, banner, cover, ss1, ss2, ss3) {
  // Ensure we're running in a Node.js environment.
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    console.error("editImages: This function must be run in a Node environment.");
    return false;
  }
  
  try {
    // Dynamically import Node modules.
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    // Import sharp for image conversion.
    const sharp = (await import('sharp')).default;
    
    // Determine __filename and __dirname for the current module.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Define the target directory for images.
    // Since this file is in resources/scripts, the images folder is at ../images/games/{id}
    const targetDir = path.resolve(__dirname, '../images/games', String(id));
    
    // Create the target directory (and parent directories) if it doesn't exist.
    await fs.promises.mkdir(targetDir, { recursive: true });
    
    // Prepare an array mapping each image input to its target file name.
    const imageMappings = [
      { image: banner, filename: 'banner.webp' },
      { image: cover, filename: 'cover.webp' },
      { image: ss1, filename: 'ss1.webp' },
      { image: ss2, filename: 'ss2.webp' },
      { image: ss3, filename: 'ss3.webp' },
    ];
    
    // Process each image: if provided, convert to WebP and save it.
    for (const mapping of imageMappings) {
      if (mapping.image) {
        const outPath = path.resolve(targetDir, mapping.filename);
        await sharp(mapping.image)
          .webp()
          .toFile(outPath);
      }
    }
    return true;
   } catch (error) {
    return false;
   }
}

/**
 * Deletes a game from metadataGames.csv.
 *
 * @param {string} id - The ID of the game to delete.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
async function deleteGame(id) {
  const games = await loadMetadataGames();
  const index = games.findIndex(game => game.ID === id);

  if (index === -1) {
    console.error(`Game with ID ${id} not found.`);
    return false;
  }

  games.splice(index, 1);
  await saveMetadata(games);

  // Also delete the images folder for this game.
  if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
    try {
      // Dynamically import Node modules.
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      // The images folder is at: resources/images/games/{id}
      const folderPath = path.resolve(__dirname, '../images/games', String(id));
      // Remove the folder recursively. Use fs.promises.rm if available, otherwise rmdir.
      if (fs.promises.rm) {
        await fs.promises.rm(folderPath, { recursive: true, force: true });
      } else {
        await fs.promises.rmdir(folderPath, { recursive: true });
      }
    } catch (error) {
      console.error("Error deleting game images folder:", error);
      // Continue even if the folder deletion fails.
    }
  }
  return true;
}

export { addGame, editGame, editImages, deleteGame };

/* ====================== Command-line Interface ====================== */

/**
 * Prints usage instructions.
 */
function printUsage() {
  console.log(`Usage:

For adding a game:
  node editMetadata.js addGame <title> <descriptionS> <genreTags> <releaseDate> <platform> <developerPublisher> <age> <rating> <averageCompletionTime> <descriptionL> <trailer>

For editing a game:
  node editMetadata.js editGame <id> <title> <descriptionS> <genreTags> <releaseDate> <platform> <developerPublisher> <age> <rating> <averageCompletionTime> <descriptionL> <trailer>

For deleting a game:
  node editMetadata.js deleteGame <id>
`);
}

/**
 * Main CLI function that parses process arguments and executes the corresponding function.
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("No command provided.");
    printUsage();
    process.exit(1);
  }
  
  const command = args[0];
  
  try {
    if (command === 'addGame') {
      if (args.length !== 12) {
        console.error("Invalid number of arguments for addGame.");
        printUsage();
        process.exit(1);
      }
      const [title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer] = args.slice(1);
      const newGame = await addGame(title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer);
      console.log("Added game:", newGame);
      
    } else if (command === 'editGame') {
      if (args.length !== 13) {
        console.error("Invalid number of arguments for editGame.");
        printUsage();
        process.exit(1);
      }
      const [id, title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer] = args.slice(1);
      const updatedGame = await editGame(id, title, descriptionS, genreTags, releaseDate, platform, developerPublisher, age, rating, averageCompletionTime, descriptionL, trailer);
      if (updatedGame) {
        console.log("Updated game:", updatedGame);
      } else {
        console.error(`Game with ID ${id} not found.`);
      }
      
    } else if (command === 'deleteGame') {
      if (args.length !== 2) {
        console.error("Invalid number of arguments for deleteGame.");
        printUsage();
        process.exit(1);
      }
      const id = args[1];
      const result = await deleteGame(id);
      if (result) {
        console.log(`Game with ID ${id} deleted successfully.`);
      } else {
        console.error(`Game with ID ${id} not found or deletion failed.`);
      }
      
    } else {
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  } catch (error) {
    console.error("Error executing command:", error);
    process.exit(1);
  }
}

// Run the CLI if in a Node environment and if this module is executed directly.
(async () => {
  if (typeof process !== 'undefined' &&
      process.argv &&
      process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    main();
  }
})();