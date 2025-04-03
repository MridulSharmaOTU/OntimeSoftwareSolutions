import { parseCSV } from './utils/parser.js';

/**
 * Environment-Aware CSV Loader:
 * 
 * This function loads and parses the 'metadataGames.csv' file in an environment-aware manner.
 * 
 * - In a Node environment (e.g. during pytest testing), it dynamically imports the Node.js 'fs', 'path', 
 *   and 'url' modules to read the CSV file directly from disk using an absolute path. This ensures that 
 *   any updates made by backend operations (such as editing a game) are properly reflected in subsequent reads.
 * 
 * - In a browser environment, it uses the fetch API to load the CSV file. This method is compatible with 
 *   front-end usage where Node.js modules are not available.
 *
 * @returns {Promise<Array<Object>>} - A promise that resolves to the parsed CSV data.
 */
async function loadMetadataGames() {
  // Check for Node.js environment.
  if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
    // Node environment: use dynamic imports for Node modules.
    const fs = await import('fs');

    const { ABSOLUTE_METADATA_PATH } = await import('../database/config.js');

    try {
      const csvText = await fs.promises.readFile(ABSOLUTE_METADATA_PATH, 'utf8');
      return parseCSV(csvText);
    } catch (error) {
      console.error('Error reading metadataGames.csv in Node:', error);
      return [];
    }
  } else {
    // Browser environment: use fetch.
    try {
      const response = await fetch('resources/database/metadataGames.csv');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const csvText = await response.text();
      return parseCSV(csvText);
    } catch (error) {
      console.error('Error fetching or parsing metadataGames.csv:', error);
      return [];
    }
  }
}

/**
 * Retrieves metadata for a game based on its ID.
 * @param {string} id - The game ID to look up.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing the game metadata,
 *                                    or null if the game is not found.
 */
function getGameMetadataById(id) {
  let gamesPromise = loadMetadataGames()

  let fulfilledHandler = (games) => {
	let game = games.find((item) => {
		return item.ID == id
	})

	if (game == null) {
	  return null
	}

  const formattedGenre = game["Genre Tags"] 
      ? game["Genre Tags"].split('|').map(item => item.trim()).join(', ')
      : "";

	const formattedPlatform = game.Platform 
      ? game.Platform.split('|').map(item => item.trim()).join(', ')
      : "";
	
	let metadata = {
        Title: game.Title,
        DescriptionS: game.DescriptionS,
        DescriptionL: game.DescriptionL,
        Genre: formattedGenre,
        "Release Date": game["Release Date"],
        Platform: formattedPlatform,
        "Developer/Publisher": game["Developer/Publisher"],
        Age: game.Age,
        Rating: game.Rating,
        "Average Completion Time": game["Average Completion Time"],
        Trailer: game.Trailer,
    }
	return metadata
  }
  return gamesPromise.then(fulfilledHandler)
}

export { getGameMetadataById, loadMetadataGames };