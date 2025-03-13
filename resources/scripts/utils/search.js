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
 * Converts a Roman numeral string to its numeric representation.
 * @param {string} roman - The Roman numeral string.
 * @returns {number} - The numeric representation.
 */
function convertRomanToNumber(roman) {
  const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prevValue = 0;
  roman = roman.toUpperCase();
  for (let i = roman.length - 1; i >= 0; i--) {
    const value = romanMap[roman[i]];
    if (value < prevValue) {
      total -= value;
    } else {
      total += value;
    }
    prevValue = value;
  }
  return total;
}

/**
 * Searches for games in an array of game objects whose title matches the search query.
 * Handles case insensitivity and diacritics, and converts between numeric and Roman numeral parts.
 * For pure numeric queries (e.g., "50"), the Roman numeral conversion is skipped to avoid false positives.
 * @param {Array<Object>} games - An array of game objects (already parsed).
 * @param {string} query - The search query string.
 * @returns {Array<Object>} - An array of game objects that match the search query.
 */
function searchByTitle(games, query) {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeString(trimmedQuery);
  
  // For mixed queries, create a variant that converts numeric parts to Roman numerals.
  // If the query is entirely numeric, skip this conversion.
  let romanQuery = "";
  if (!/^\d+$/.test(trimmedQuery)) {
    romanQuery = normalizeString(
      trimmedQuery.replace(/\d+/g, (match) => convertToRoman(parseInt(match, 10)))
    );
  }
  
  // Create a variant converting any Roman numeral substrings to digits.
  const digitQuery = normalizeString(
    trimmedQuery.replace(/\b[MCDLXVI]+\b/gi, (match) => convertRomanToNumber(match).toString())
  );
  
  const titleKey = "Title";
  return games.filter(game => {
    if (game[titleKey]) {
      const normalizedTitle = normalizeString(game[titleKey]);
      return normalizedTitle.includes(normalizedQuery) ||
             (romanQuery && normalizedTitle.includes(romanQuery)) ||
             normalizedTitle.includes(digitQuery);
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
  const csv4 = "Title\nHalf-Life 2\nPortal\nFinal Fantasy 7: Rebirth\nFinal Fantasy VII: Advent Children";
  test("Numbers in search query for 'Final Fantasy 7'", csv4, "Final Fantasy 7", ["Final Fantasy 7: Rebirth", "Final Fantasy VII: Advent Children"]);

  // Test 5: Special characters in search.
  const csv5 = "Title\nPokemon Red\nPokémon Yellow\nSuper Mario";
  test("Special characters in search for 'Pokémon'", csv5, "Pokémon", ["Pokemon Red", "Pokémon Yellow"]);
}

runTests();