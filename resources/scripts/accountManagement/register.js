// register.js (ES Module version)
import { fileURLToPath } from "url";
import path from "path";

/**
 * Asynchronously creates a new account in accounts.csv.
 *
 * @param {string} username - The username (unique identifier).
 * @param {string} password - The user's password.
 * @param {string} email - The user's email.
 * @param {boolean|string|number} admin - Whether the account is an admin.
 * @param {boolean|string|number} verified - Whether the account is verified.
 * @returns {Promise<Object>} - A promise that resolves to the new user object.
 * @throws {Error} - Throws if the username already exists or if file operations fail.
 */
async function createAccount(username, password, email, admin, verified) {
  const fs = await import("fs");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvPath = path.join(__dirname, "../../database/accounts.csv");

  // Convert admin and verified values to "TRUE" or "FALSE"
  admin = (admin === true || admin === "True" || admin === "1") ? true : false;
  verified = (verified === true || verified === "True" || verified === "1") ? true : false;

  const newUser = { username, password, email, admin, verified };

  let accounts = [];
  try {
    // Check if the CSV file exists
    if (fs.existsSync(csvPath)) {
      const data = await fs.promises.readFile(csvPath, "utf8");
      const lines = data.split("\n").filter(Boolean);
      if (lines.length > 0) {
        const headers = lines[0].split(",");
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const entry = {};
          headers.forEach((h, j) => {
            entry[h] = values[j];
          });
          accounts.push(entry);
        }
      }
    } else {
      // Create the file with headers if it doesn't exist
      await fs.promises.writeFile(csvPath, "username,password,email,admin,verified\n", "utf8");
    }
  } catch (error) {
    console.error("Error reading accounts file:", error);
    throw error;
  }

  // Check if the username already exists
  if (accounts.find(acc => acc.username === username)) {
    const errorMessage = "Username already exists.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Add the new user and write back to the CSV file
  accounts.push(newUser);
  const header = "username,password,email,admin,verified";
  const rows = accounts.map(a => `${a.username},${a.password},${a.email},${a.admin},${a.verified}`);
  const content = [header, ...rows].join("\n") + "\n";

  try {
    await fs.promises.writeFile(csvPath, content, "utf8");
  } catch (error) {
    console.error("Error writing accounts file:", error);
    throw error;
  }
  
  console.log("Account created.");
  return newUser;
}

export { createAccount };

// CLI entry point
if (process.argv[2] === "createAccount") {
  createAccount(...process.argv.slice(3))
    .then(newUser => {
      console.log("Account created via CLI:", newUser);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}