/**
 * parser.js
 *
 * This module provides functions to load and parse the metadataGames.csv file.
 * The CSV parser is simple and assumes that fields do not contain commas or quotes.
 * For each record, the first row of the CSV is used as headers.
 */

/**
 * Retrieves metadata for a game based on its ID.
 * @param {string} id - The game ID to look up.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing the game metadata,
 *                                    or null if the game is not found.
 */
function parseCSV(text) {    
    // Split the text into lines and remove any extra empty lines
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    
    // The first line is assumed to be the header row
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Process the remaining lines
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || "";
      });
      return record;
    });
    
    return data;
  }

export { parseCSV };