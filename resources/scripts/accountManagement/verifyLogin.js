// verifyLogin.js (ES Module version)
import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, "../../database/accounts.csv");

/**
 * Asynchronously validates user login credentials.
 *
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @returns {Promise<Object>} - Resolves with { success: true } if the login is successful,
 *                              or { success: false, error: "User not found." } or
 *                              { success: false, error: "Incorrect password." }.
 */
async function loginCredentials(username, password) {
  try {
    await fs.access(csvPath);
  } catch (err) {
    return { success: false, error: "User not found." };
  }

  const data = await fs.readFile(csvPath, "utf8");
  const lines = data.split("\n").filter(Boolean);
  if (lines.length === 0) {
    return { success: false, error: "User not found." };
  }

  const headers = lines[0].split(",");
  const indexMap = {};
  headers.forEach((header, i) => {
    indexMap[header] = i;
  });

  let userRow = null;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols[indexMap["username"]] === username) {
      userRow = cols;
      break;
    }
  }

  if (!userRow) {
    return { success: false, error: "User not found." };
  }

  // Check if the password matches
  if (userRow[indexMap["password"]] !== password) {
    return { success: false, error: "Incorrect password." };
  }

  // Optionally, you can also verify if the account has been verified
  if (userRow[indexMap["verified"]].toUpperCase() !== "TRUE") {
    return { success: false, error: "Account not verified." };
  }

  return { success: true };
}

export { loginCredentials };

// CLI entry point for testing purposes
if (process.argv[2] === "loginCredentials") {
  const username = process.argv[3];
  const password = process.argv[4];
  loginCredentials(username, password)
    .then(result => {
      if (result.success) {
        console.log("true");
        process.exit(0);
      } else {
        console.log(result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(err.message);
      process.exit(1);
    });
}