fetch('https://168kh.net/movies/jeueh')
  .then(r=>r.text())
  .then(t=>{ 
    const matches = t.match(/source-\d+/g);
    console.log(matches ? [...new Set(matches)] : 'No sources found'); 
  })
