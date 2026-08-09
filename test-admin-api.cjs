const puppeteer = require('puppeteer');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  
  const page = await browser.newPage();
  
  // Log all network requests
  page.on('response', async r => {
    const url = r.url();
    if (url.includes('/api/')) {
      try {
        const json = await r.json();
        console.log('--- API Response:', url);
        console.log(JSON.stringify(json).substring(0, 500));
      } catch(e) {}
    }
    if (url.includes('.m3u8')) {
      console.log('--- M3U8 Found:', url);
    }
  });

  console.log('Logging in...');
  await page.goto('https://admin168kh.com/login', { waitUntil: 'networkidle2' });
  
  // Wait for email and password fields
  await page.waitForSelector('input[type="email"], input[name="identifier"], input[type="text"]');
  await page.waitForSelector('input[type="password"]');
  
  // Fill credentials
  await page.type('input[type="email"], input[name="identifier"], input[type="text"]', process.env.KH168_EMAIL);
  await page.type('input[type="password"]', process.env.KH168_PASSWORD);
  
  // Click login
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await b.evaluate(node => node.textContent);
    if (text.toLowerCase().includes('log') || text.toLowerCase().includes('sign')) {
      await b.click();
      break;
    }
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  console.log('Logged in! Current URL:', page.url());
  
  // Go to movies list
  await page.goto('https://admin168kh.com/movies', { waitUntil: 'networkidle2' });
  
  console.log('Finding a movie to play...');
  // Click the first movie link or play button
  const links = await page.$$('a');
  let clicked = false;
  for (const link of links) {
    const href = await link.evaluate(node => node.getAttribute('href'));
    if (href && href.includes('/movies/') && !href.endsWith('/edit')) {
      console.log('Clicking movie link:', href);
      await link.click();
      clicked = true;
      break;
    }
  }
  
  if (clicked) {
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('Done.');
  await browser.close();
})();
