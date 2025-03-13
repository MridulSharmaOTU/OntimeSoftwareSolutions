/**
 * search.js
 *
 * This module provides functions for searching game metadata,
 * including helper functions to handle normalization and numeric queries.
 */

/**
 * Normalizes a string by removing diacritical marks and converting to lowercase.
 * @param {string} str - The string to normalize.
 * @returns {string} - The normalized string.
 */
function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Converts an integer to its Roman numeral representation.
 * @param {number} num - The number to convert.
 * @returns {string} - The Roman numeral representation.
 */
function convertToRoman(num) {
  const romanNumerals = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  let result = '';
  for (let { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

/**
 * Searches for games in an array of game objects whose title matches the search query.
 * Handles case insensitivity, diacritics, and if the query is numeric,
 * it also checks for the Roman numeral representation.
 * @param {Array<Object>} games - An array of game objects (already parsed).
 * @param {string} query - The search query string.
 * @returns {Array<Object>} - An array of game objects that match the search query.
 */
function searchByTitle(games, query) {
  const normalizedQuery = normalizeString(query.trim());
  let romanQuery = "";
  
  // If the query is entirely numeric, convert it to a Roman numeral.
  if (/^\d+$/.test(query.trim())) {
    const num = parseInt(query.trim(), 10);
    romanQuery = normalizeString(convertToRoman(num));
  }
  
  // Define the header key that contains the game title.
  const titleKey = "Title";
  
  // Filter games based on the search query.
  return games.filter(game => {
    if (game[titleKey]) {
      const normalizedTitle = normalizeString(game[titleKey]);
      // Check for direct substring match.
      if (normalizedTitle.includes(normalizedQuery)) return true;
      // If applicable, also check if the title contains the Roman numeral.
      if (romanQuery && normalizedTitle.includes(romanQuery)) return true;
    }
    return false;
  });
}

export { searchByTitle }; // Comment this line to run the TDD tests


/* ======= TDD TESTS ======= */

/**
 * This parser assumes:
 *   - The first line is the header (only "Title" in these tests).
 *   - No quoted fields, no commas in the data itself.
 */
function parseCSV(csvText) {
  // Split the text into lines and remove any empty lines
  const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
  
  // The first line is assumed to be the header row
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Process the remaining lines
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    return record;
  });
  
  return data;
}

/**
 * Runs a suite of tests for the searchByTitle function.
 */
function runTests() {
  console.log("Running tests for searchByTitle...");

  /**
   * A simple test function that logs pass/fail messages.
   * @param {string} description - A short description of the test.
   * @param {string} csvData - CSV string to be used as input.
   * @param {string} query - The search query.
   * @param {Array<string>} expectedTitles - Expected game titles to be returned.
   */
  function test(description, csvData, query, expectedTitles) {
    // 1. Parse the CSV into an array of objects
    const games = parseCSV(csvData);
    // 2. Pass the array into searchByTitle
    const results = searchByTitle(games, query);
    // 3. Extract titles from results
    const titles = results.map(item => item["Title"]);
    // 4. Compare to expected
    const passed = JSON.stringify(titles) === JSON.stringify(expectedTitles);
    if (passed) {
      console.log(`PASS: ${description}`);
    } else {
      console.error(`FAIL: ${description}\n  Expected: ${JSON.stringify(expectedTitles)}\n  Got: ${JSON.stringify(titles)}`);
    }
  }

  // Test 1: Search for an empty string should return all games.
  const csv1 = "Title\nSuper Mario\nZelda\nMinecraft";
  test("Empty string returns all games", csv1, "", ["Super Mario", "Zelda", "Minecraft"]);

  // Test 2: Basic substring match.
  const csv2 = "Title\nSuper Mario Bros\nThe Legend of Zelda: Breath of the Wild\nThe Legend of Zelda: Tears of the Kingdom";
  test("Basic substring match for 'Zelda'", csv2, "Zelda", ["The Legend of Zelda: Breath of the Wild", "The Legend of Zelda: Tears of the Kingdom"]);

  // Test 3: Multiple words search.
  const csv3 = "Title\nSuper Mario Bros\nMario Kart\nSuper Smash Bros";
  test("Multiple words search for 'Super Mario'", csv3, "Super Mario", ["Super Mario Bros"]);

  // Test 4: Numbers in search query (should match both numeric and Roman numeral formats).
  const csv4 = "Title\nHalf-Life 2\nPortal\nDiablo II";
  test("Numbers in search query for '2'", csv4, "2", ["Half-Life 2", "Diablo II"]);

  // Test 5: Special characters in search.
  const csv5 = "Title\nPokemon Red\nPokémon Yellow\nSuper Mario";
  test("Special characters in search for 'Pokémon'", csv5, "Pokémon", ["Pokemon Red", "Pokémon Yellow"]);
}

runTests();