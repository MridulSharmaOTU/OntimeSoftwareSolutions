// metadataGame.js
import { loadMetadataGames } from './parser.js';

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

	const formattedPlatform = game.Platform 
      ? game.Platform.split('|').map(item => item.trim()).join(', ')
      : "";
	
	let metadata = {
        Title: game.Title,
        Description: game.Description,
        Genre: game.Genre || game["Genre Tag"],
        "Release Date": game["Release Date"],
        Platform: formattedPlatform,
        "Developer/Publisher": game["Developer/Publisher"],
        Age: game.Age,
        Rating: game.Rating,
        "Average Completion Time": game["Average Completion Time"]
    }
	return metadata
  }
  return gamesPromise.then(fulfilledHandler)
}

export { getGameMetadataById };
