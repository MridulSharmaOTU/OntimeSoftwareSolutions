// verifyEmail.js (ES Module version)
import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, "../../database/accounts.csv");

/**
 * Asynchronously verifies a user account by updating the "verified" field to "TRUE"
 * in the accounts.csv file.
 *
 * @param {string} username - The username of the account to verify.
 * @returns {Promise<Object>} - Resolves with a message if the account is verified.
 * @throws {Error} - If the file doesn't exist or the account is not found.
 */
async function verifyAccount(username) {
  try {
    // Check if the accounts.csv file exists.
    await fs.access(csvPath);
  } catch (err) {
    throw new Error("accounts.csv not found");
  }

  // Read the CSV file.
  const data = await fs.readFile(csvPath, "utf8");
  const lines = data.split("\n").filter(Boolean);
  if (lines.length === 0) {
    throw new Error("accounts.csv is empty");
  }

  const headers = lines[0].split(",");
  const indexMap = {};
  headers.forEach((header, i) => {
    indexMap[header] = i;
  });

  let found = false;
  const updatedLines = lines.map((line, idx) => {
    if (idx === 0) return line; // Keep header row unchanged.
    const cols = line.split(",");
    if (cols[indexMap["username"]] === username) {
      cols[indexMap["verified"]] = true;
      found = true;
    }
    return cols.join(",");
  });

  if (!found) {
    throw new Error("Account not found.");
  }

  // Write the updated CSV data back to the file.
  await fs.writeFile(csvPath, updatedLines.join("\n"), "utf8");
  return { message: "Account verified." };
}

export { verifyAccount };

// CLI entry point for testing purposes.
if (process.argv[2] === "verifyAccount") {
  const username = process.argv[3];
  verifyAccount(username)
    .then(result => {
      console.log(result.message);
      process.exit(0);
    })
    .catch(err => {
      console.error(err.message);
      process.exit(1);
    });
}