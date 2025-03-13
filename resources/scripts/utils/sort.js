/**
 * sort.js
 *
 * This module provides sorting functions that operate on
 * an array of game objects (as returned by parseCSV).
 * Each function modifies the array in place and also returns it.
 */

/**
 * Sorts the array of games alphabetically by title (A-Z).
 * @param {Array<Object>} games - An array of game objects.
 * @returns {Array<Object>} - The same array, sorted in place.
 */
function sortTitle(games) {
    return games.sort((a, b) => {
      const titleA = (a.Title || "").toLowerCase();
      const titleB = (b.Title || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });
  }
  
  /**
   * Sorts the array of games by newest release first.
   * Attempts to parse the "Release Date" field; if invalid, treats it as the oldest.
   * @param {Array<Object>} games - An array of game objects.
   * @returns {Array<Object>} - The same array, sorted in place.
   */
  function sortRelease(games) {
    return games.sort((a, b) => {
      const dateA = Date.parse(a["Release Date"]) || 0;
      const dateB = Date.parse(b["Release Date"]) || 0;
      // Newest first => descending order
      return dateB - dateA;
    });
  }
  
  /**
   * Sorts the array of games by highest rating first.
   * If the "Rating" field is not a valid number, treats it as 0.
   * @param {Array<Object>} games - An array of game objects.
   * @returns {Array<Object>} - The same array, sorted in place.
   */
  function sortRating(games) {
    return games.sort((a, b) => {
      const ratingA = parseFloat(a.Rating);
      const ratingB = parseFloat(b.Rating);
      const finalA = isNaN(ratingA) ? 0 : ratingA;
      const finalB = isNaN(ratingB) ? 0 : ratingB;
      // Highest first => descending order
      return finalB - finalA;
    });
  }
  
  /**
   * Reverses the array of games in place.
   * @param {Array<Object>} games - An array of game objects.
   * @returns {Array<Object>} - The same array, reversed in place.
   */
  function reverse(games) {
    return games.reverse();
  }
  
  export { sortTitle, sortRelease, sortRating, reverse };