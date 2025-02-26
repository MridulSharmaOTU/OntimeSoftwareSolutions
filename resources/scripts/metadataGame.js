// metadataGame.js
import { loadMetadataGames } from './parser.js';

/**
 * Retrieves metadata for a game based on its ID.
 * @param {string} id - The game ID to look up.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing the game metadata,
 *                                    or null if the game is not found.
 */
FUNCTION getGameMetadataById(id):
    // Load the list of game metadata records asynchronously
    CALL loadMetadataGames() AND WHEN COMPLETED WITH games:
    
        // Search for the game record with a matching ID
        SET game = FIND record IN games WHERE record.ID EQUALS id
        
        IF game IS NOT FOUND THEN
            RETURN null
        END IF

        // Process the Platform field if it exists
        IF game.Platform EXISTS THEN
            // Split the Platform string using "|" as a delimiter, trim each part, and join them with ", "
            SET platformList = SPLIT game.Platform BY "|"
            FOR EACH item IN platformList:
                TRIM item
            END FOR
            SET formattedPlatform = JOIN platformList WITH ", "
        ELSE
            SET formattedPlatform = ""  // Empty string if Platform field is missing
        END IF

        // Build and return the metadata object with the desired fields
        SET metadata = {
            Title: game.Title,
            Description: game.Description,
            Genre: IF game.Genre EXISTS THEN game.Genre ELSE game["Genre Tag"],
            "Release Date": game["Release Date"],
            Platform: formattedPlatform,
            "Developer/Publisher": game["Developer/Publisher"],
            Age: game.Age,
            Rating: game.Rating,
            "Average Completion Time": game["Average Completion Time"]
        }
        
        RETURN metadata
    END CALL
END FUNCTION

export { getGameMetadataById };
