// register.js
const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, '../../database/accounts.csv');

function createAccount(username, password, email, admin, verified) {
  // Convert booleans to string values
  admin = (admin === 'true' || admin === 'True' || admin === '1') ? 'TRUE' : 'FALSE';
  verified = (verified === 'true' || verified === 'True' || verified === '1') ? 'TRUE' : 'FALSE';

  const newUser = { username, password, email, admin, verified };

  // Read existing users
  let accounts = [];
  if (fs.existsSync(csvPath)) {
    const data = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
    const headers = data[0].split(',');
    for (let i = 1; i < data.length; i++) {
      const values = data[i].split(',');
      const entry = {};
      headers.forEach((h, j) => entry[h] = values[j]);
      accounts.push(entry);
    }
  } else {
    // Create file with headers if missing
    fs.writeFileSync(csvPath, 'username,password,email,admin,verified\n');
  }

  // Check if user already exists
  if (accounts.find(acc => acc.username === username)) {
    console.error('Username already exists.');
    process.exit(1);
  }

  // Add and write back
  accounts.push(newUser);
  const allRows = ['username,password,email,admin,verified'].concat(
    accounts.map(a => `${a.username},${a.password},${a.email},${a.admin},${a.verified}`)
  );
  fs.writeFileSync(csvPath, allRows.join('\n'), 'utf-8');
  console.log('Account created.');
  process.exit(0);
}

// CLI entry
if (process.argv[2] === 'createAccount') {
  createAccount(...process.argv.slice(3));
}
