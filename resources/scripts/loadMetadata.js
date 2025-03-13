// loadMetadata.js
import { parseCSV } from './utils/parser.js';

/**
 * Loads the metadataGames.csv file from the resources/database folder and parses it.
 * @returns {Promise<Array<Object>>} - A promise that resolves to the parsed CSV data.
 */
function loadMetadataGames() {
  // Adjust the path as necessary to match your folder structure
  return fetch('resources/database/metadataGames.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.text();
    })
    .then(csvText => parseCSV(csvText))
    .catch(error => {
      console.error('Error fetching or parsing metadataGames.csv:', error);
      return [];
    });
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