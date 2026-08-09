import fs from 'fs';
const html = fs.readFileSync('jeueh-source.html', 'utf8');

const regex = /admin168kh\.com\\*\/api\\*\/streams\\*\/hls\\*\/([a-zA-Z0-9_-]+)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Found token:', match[1]);
}

const dataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);
  fs.writeFileSync('next-data.json', JSON.stringify(data, null, 2));
  console.log('Wrote NEXT_DATA to next-data.json');
} else {
  console.log('No NEXT_DATA found');
}
