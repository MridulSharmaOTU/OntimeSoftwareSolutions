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

export { searchByTitle };