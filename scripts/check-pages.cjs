const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'api') results = results.concat(walk(full));
    } else results.push(full);
  });
  return results;
}

const pageFiles = walk('src/app').filter(f => f.endsWith('page.tsx') || f.endsWith('layout.tsx'));
pageFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes("runtime = 'edge'") || content.includes('runtime = "edge"')) {
    console.log('Has edge runtime:', f);
  }
});
