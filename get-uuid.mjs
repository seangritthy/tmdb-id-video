fetch('https://168kh.net/movies/hdhdh')
  .then(r=>r.text())
  .then(t=>{ 
    const m = t.match(/\\"slug\\":\\"hdhdh\\".*?\\"uuid\\":\\"([^\\"]+)\\"/); 
    console.log(m ? m[1] : 'Not found'); 
  })
