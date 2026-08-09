(async () => {
  const htmlRes = await fetch('https://168kh.net/movies/fjjhdhd');
  const html = await htmlRes.text();
  const jsFiles = [...html.matchAll(/src=\"(\/_next\/static\/chunks\/[^\"]+\.js)\"/g)].map(m => m[1]);
  for (const js of jsFiles) {
    const jsUrl = 'https://168kh.net' + js;
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    if (jsCode.includes('token=')) {
      console.log('Found token= in', js);
      const idx = jsCode.indexOf('token=');
      const snippet = jsCode.substring(Math.max(0, idx - 100), Math.min(jsCode.length, idx + 200));
      console.log(snippet);
    }
  }
})();
