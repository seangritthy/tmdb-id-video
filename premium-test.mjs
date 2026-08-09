import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let extractedUrl = null;
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('admin168kh.com/api/streams/hls') && url.includes('.m3u8')) {
      extractedUrl = url;
    }
  });

  // Login flow
  await page.goto('https://168kh.net', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.innerText.includes('ចូលគណនី')) { b.click(); }
    }
  });
  
  await page.waitForSelector('input[type="text"]', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.type('input[type="text"]', process.env.KH168_EMAIL);
  await page.type('input[type="password"]', process.env.KH168_PASSWORD);
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.type === 'submit') { b.click(); }
    }
  });
  
  await new Promise(r => setTimeout(r, 5000)); // wait for login
  
  // Go to premium movie
  console.log('Navigating to premium movie: pklj');
  await page.goto('https://168kh.net/movies/pklj', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div.group'));
    for (const b of btns) {
      if (b.innerHTML.includes('lucide-play')) { b.click(); }
    }
  });
  
  for (let i = 0; i < 15; i++) {
    if (extractedUrl) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Extracted URL:', extractedUrl);
  await browser.close();
})();
