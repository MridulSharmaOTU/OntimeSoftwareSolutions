import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV } from './utils/parser.js';

// Define __filename and __dirname for ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since editMetadata.js is in resources/scripts, go up one level to resources and then into database.
const metadataPath = path.join(__dirname, '../database/metadataGames.csv');

/**
 * Loads the metadataGames.csv file from disk and parses it.
 *
 * @returns {Promise<Array<Object>>} - A promise that resolves to the parsed CSV data.
 */
async function loadMetadataGames() {
  try {
    const csvText = await fs.promises.readFile(metadataPath, 'utf8');
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading metadataGames.csv:', error);
    return [];
  }
}

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
 * @param {Array<Object>} data - The game objects to be saved.
 * @returns {Promise<void>}
 */
async function saveMetadata(data) {
  try {
    const csvText = convertToCSV(data);
    await fs.promises.writeFile(metadataPath, csvText, 'utf8');
  } catch (error) {
    console.error('Error saving metadata:', error);
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
  // Step 1: Load the list of existing games from the CSV file.
  //let games = loadGamesFromCSV()
  let games = await loadMetadataGames();

  // Step 2: Determine a new unique ID.
  // If there are games, take the maximum current ID and add one.
  // Otherwise, start at 1.
  let gameIDs = games.map((game) => {
	return game.ID;
  });
  let newId = games != null && games.length != 0 ? Math.max(...gameIDs) + 1 : 1;

  // Step 3: Create a new game object using the provided parameters.
  let newGame = {
      "ID": newId,
      "Title": title,
      "DescriptionS": descriptionS,
      "Genre Tags": genreTags,
      "Release Date": releaseDate,
      "Platform": platform,
      "Developer/Publisher": developerPublisher,
      "Age": age,
      "Rating": rating,
      "Average Completion Time": averageCompletionTime,
      "DescriptionL": descriptionL,
      "Trailer": trailer
  }

  // Step 4: Append the new game object to the list of games.
  //add newGame to games
  games.push(newGame);

  //console.log(games)
  

  // Step 5: Save the updated list of games back to the CSV file.
  //saveGamesToCSV(games)
  await saveMetadata(games);

  // Step 6: Return the newly added game.
  return newGame
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
  // Step 1: Load the current list of games from the CSV file.
  games = await loadMetadataGames();

  // Step 2: Find the index of the game with the matching ID.
  //index = find index where game.ID equals id in games
  index = games.findIndex((game) => game.ID == id);
  if (index < 0) {
      // Log error and return null if the game does not exist.
      console.err(`Game with ID ${id} not found.`)
      return null;
  }

  // Step 3: Make a copy of the existing game data.
  //updatedGame = copy of games[index]
  updatedGame = structuredClone(games[index]);

  // Step 4: For each field, if a new value is provided (i.e., not empty or null),
  // update the corresponding property in updatedGame.
  if (title != null && title != "") {
      updatedGame.Title = title;
  }
  if (descriptionS != null && descriptionS != "") {
      updatedGame.DescriptionS = descriptionS;
  }
  if (genreTags != null && genreTags != "") {
      updatedGame["Genre Tags"] = genreTags;
  }
  if (releaseDate != null && releaseDate != "") {
      updatedGame["Release Date"] = releaseDate;
  }
  if (platform != null && platform != "") {
      updatedGame.Platform = platform;
  }
  if (developerPublisher != null && developerPublisher != "") {
      updatedGame["Developer/Publisher"] = developerPublisher;
  }
  if (age != null && age != "") {
      updatedGame.Age = age;
  }
  if (rating != null && rating != "") {
      updatedGame.Rating = rating;
  }
  if (averageCompletionTime != null && averageCompletionTime != "") {
      updatedGame["Average Completion Time"] = averageCompletionTime;
  }
  if (descriptionL != null && descriptionL != "") {
      updatedGame.DescriptionL = descriptionL;
  }
  if (trailer != null && trailer != "") {
      updatedGame.Trailer = trailer;
  }

  // Step 5: Replace the existing game with the updated version.
  games[index] = updatedGame;

  // Step 6: Save the updated list of games back to the CSV file.
  await saveMetadata(games);

  // Step 7: Return the updated game object.
  return updatedGame;
}

/**
 * Deletes a game from metadataGames.csv.
 *
 * @param {string} id - The ID of the game to delete.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
/*
async function deleteGame(id) {
  // Step 1: Load the current list of games from the CSV file.
  games = loadGamesFromCSV()

  // Step 2: Find the index of the game with the given ID.
  index = find index where game.ID equals id in games
  if index is not found:
      // Log error and return false if the game is not found.
      log "Game with ID [id] not found."
      return false

  // Step 3: Remove the game from the list.
  remove the game at position index from games

  // Step 4: Save the updated list back to the CSV file.
  saveGamesToCSV(games)

  // Step 5: Return true to indicate successful deletion.
  return true
}
*/

function deleteGame() {}

export { addGame, editGame, deleteGame };
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

// Run the CLI if this module is executed directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
