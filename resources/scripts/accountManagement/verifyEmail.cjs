const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../../database/accounts.csv');

function verifyAccount(username) {
  if (!fs.existsSync(csvPath)) {
    console.error('accounts.csv not found');
    process.exit(1);
  }

  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
  const headers = lines[0].split(',');
  const indexMap = headers.reduce((map, key, i) => (map[key] = i, map), {});
  let found = false;

  const updatedLines = lines.map((line, idx) => {
    if (idx === 0) return line;
    const cols = line.split(',');
    if (cols[indexMap.username] === username) {
      cols[indexMap.verified] = 'TRUE';
      found = true;
    }
    return cols.join(',');
  });

  if (!found) {
    console.error('Account not found.');
    process.exit(1);
  }

  fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf-8');
  console.log('Account verified.');
  process.exit(0);
}

if (require.main === module) {
  const [, , command, username] = process.argv;
  if (command === 'verifyAccount') {
    verifyAccount(username);
  }
}

