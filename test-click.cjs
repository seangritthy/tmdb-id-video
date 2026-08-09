const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  
  page.on('request', r => {
    const url = r.url();
    if (url.includes('.m3u8') || url.includes('player') || url.includes('api')) {
      console.log(r.method(), url);
    }
  });

  await page.goto('https://168kh.net/movies/jeueh', { waitUntil: 'networkidle2' });
  
  const buttons = await page.$$('button');
  console.log('Found', buttons.length, 'buttons');
  for (const b of buttons) {
    try {
      await b.evaluate(node => node.click());
      await new Promise(r => setTimeout(r, 1000));
    } catch(e) {}
  }
  
  // also click links
  const links = await page.$$('a');
  for (const b of links) {
    try {
      const text = await b.evaluate(node => node.textContent);
      if (text.toLowerCase().includes('play')) {
        await b.evaluate(node => node.click());
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch(e) {}
  }

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
