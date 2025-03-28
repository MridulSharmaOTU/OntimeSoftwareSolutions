const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../../database/accounts.csv');

function loginCredentials(username, password) {
  if (!fs.existsSync(csvPath)) {
    console.log('false');
    process.exit(0);
  }

  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(Boolean);
  const headers = lines[0].split(',');
  const indexMap = headers.reduce((map, key, i) => (map[key] = i, map), {});

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (
      cols[indexMap.username] === username &&
      cols[indexMap.password] === password &&
      cols[indexMap.verified].toUpperCase() === 'TRUE'
    ) {
      console.log('true');
      process.exit(0);
    }
  }

  console.log('false');
  process.exit(0);
}

if (require.main === module) {
  const [, , command, username, password] = process.argv;
  if (command === 'loginCredentials') {
    loginCredentials(username, password);
  }
}

