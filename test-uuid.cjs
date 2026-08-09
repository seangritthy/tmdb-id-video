const fetch = require('node-fetch');
fetch('https://168kh.net/movies/jeueh').then(r=>r.text()).then(t => { 
  const slugIdx = t.indexOf('\\"slug\\":\\"jeueh\\"'); 
  const context = t.substring(Math.max(0, slugIdx - 500), slugIdx + 50); 
  console.log(context.match(/\\"uuid\\":\\"([a-f0-9\\-]+)\\"/i)); 
});
