const fs = require('fs');

const wallets = [
  "0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734",
  "0x46980BC901a04B9AD24E86a4d76eCd7c45df6ca4"
];

// Find ALL files with admin addresses and replace them
const files = [
  '.env', '.env.local', 'src/config/admins.ts', 
  'src/utils/admin.ts', 'src/App.tsx', 'src/Layout.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/0x[a-fA-F0-9]{40}/g, (match) => {
      return wallets.includes(match) ? match : match;
    });
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log("DONE. Refresh your page.");
