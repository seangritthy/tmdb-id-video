import fs from 'fs';
fetch('https://168kh.net/movies/jeueh')
  .then(r => r.text())
  .then(html => {
    fs.writeFileSync('jeueh-source.html', html);
    console.log('Saved to jeueh-source.html');
  });
