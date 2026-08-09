fetch('https://asiadrama.net/?s=jeueh')
  .then(r => r.text())
  .then(html => {
    const matches = html.match(/href="https:\/\/asiadrama\.net\/([^\/]+)\/"/g);
    console.log(matches ? [...new Set(matches)] : 'No matches found');
  })
