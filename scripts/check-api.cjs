const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results = results.concat(walk(full));
    else results.push(full);
  });
  return results;
}

const apiFiles = walk('src/app/api').filter(f => f.endsWith('.ts') || f.endsWith('.js'));
apiFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const hasEdge = content.includes("runtime = 'edge'") || content.includes('runtime = "edge"');
  if (!hasEdge) {
    console.log('Adding runtime = edge to:', f);
    content = `export const runtime = 'edge';\n` + content;
    fs.writeFileSync(f, content, 'utf8');
  } else {
    console.log('Already edge:', f);
  }
});
