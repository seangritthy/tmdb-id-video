import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('request', req => {
    if (req.url().includes('api/movies') || req.url().includes('api/streams')) {
      console.log('API Request:', req.url());
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('api/movies') || url.includes('api/streams')) {
      try {
        const text = await res.text();
        console.log('API Response:', url);
        console.log(text.substring(0, 500));
      } catch (e) {}
    }
  });

  await page.goto('https://168kh.net/movies/jeueh', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
