/**
 * parser.js
 *
 * This module provides functions to load and parse the metadataGames.csv file.
 * The CSV parser is simple and assumes that fields do not contain commas or quotes.
 * For each record, the first row of the CSV is used as headers.
 */

/**
 * Parses CSV text into an array of objects.
 * @param {string} text - The CSV text.
 * @returns {Array<Object>} - Array of parsed records.
 */
FUNCTION parseCSV(text):
    // Remove leading/trailing whitespace and split text into lines
    SET trimmedText = TRIM(text)
    SET lines = SPLIT(trimmedText, NEWLINE)
    REMOVE any lines from 'lines' that are empty or contain only whitespace

    // Use the first line as headers and split by comma
    SET headers = SPLIT(lines[0], ',') and TRIM each header

    INITIALIZE data as an empty list

    // Process each remaining line to create a record
    FOR each line in lines starting from the second line:
        SET values = SPLIT(line, ',') and TRIM each value
        INITIALIZE record as an empty dictionary

        // Map each header to the corresponding value
        FOR index from 0 to LENGTH(headers) - 1:
            IF values[index] exists THEN
                SET record[headers[index]] = values[index]
            ELSE
                SET record[headers[index]] = an empty string
            END IF
        END FOR

        ADD record to data
    END FOR

    RETURN data
END FUNCTION

/**
 * Loads the metadataGames.csv file from the resources/database folder and parses it.
 * @returns {Promise<Array<Object>>} - A promise that resolves to the parsed CSV data.
 */
FUNCTION loadMetadataGames():
    // Attempt to fetch the CSV file from the specified path
    PERFORM HTTP GET request for "resources/database/metadataGames.csv"
    IF the response status is not OK THEN
        RAISE an error with the message "Network response was not ok" and the response status text
    END IF

    // Read the CSV text from the response
    SET csvText = response text

    // Parse the CSV text into data records
    SET parsedData = parseCSV(csvText)

    RETURN parsedData

    // Handle any errors that occur during fetch or parsing
    IF any error occurs THEN
        LOG "Error fetching or parsing metadataGames.csv:" along with the error
        RETURN an empty list
    END IF
END FUNCTION

// Export the functions so they can be used in other modules
export { parseCSV, loadMetadataGames };
