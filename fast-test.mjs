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

  console.time('total');
  
  // Go directly to movie page
  console.time('goto movie');
  await page.goto('https://168kh.net/movies/hdhdh', { waitUntil: 'domcontentloaded' });
  console.timeEnd('goto movie');

  // Find login button
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.innerText.includes('ចូលគណនី')) {
        b.click();
        return true;
      }
    }
    return false;
  });

  if (clicked) {
    console.log('Clicked login on movie page!');
    await page.waitForSelector('input[type="text"]', { timeout: 3000 });
    await page.type('input[type="text"]', process.env.KH168_EMAIL);
    await page.type('input[type="password"]', process.env.KH168_PASSWORD);
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        if (b.type === 'submit') { b.click(); }
      }
    });

    console.log('Submitted login. Waiting for iframe or token...');
    
    // Instead of waiting and reloading, wait for the network request!
    for (let i = 0; i < 30; i++) {
      if (extractedUrl) break;
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.timeEnd('total');
  console.log('Extracted URL:', extractedUrl);
  await browser.close();
})();
