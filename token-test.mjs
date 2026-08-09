import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let extractedToken = null;
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('admin168kh.com/api/streams/hls') && url.includes('.m3u8')) {
      const urlObj = new URL(url);
      extractedToken = urlObj.searchParams.get('token');
      console.log('Intercepted token:', extractedToken);
    }
  });

  console.log('Logging in...');
  await page.goto('https://168kh.net', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  
  let modalOpened = false;
  for (let attempt = 0; attempt < 5; attempt++) {
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
      try {
        await page.waitForSelector('input[type="text"]', { timeout: 2000 });
        modalOpened = true;
        break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  
  if (modalOpened) {
    await new Promise(r => setTimeout(r, 2000));
    await page.type('input[type="text"]', process.env.KH168_EMAIL || '');
    await page.type('input[type="password"]', process.env.KH168_PASSWORD || '');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        if (b.type === 'submit') { b.click(); }
      }
    });
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('Going to free movie hdhdh...');
  await page.goto('https://168kh.net/movies/hdhdh', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div.group'));
    for (const b of btns) {
      if (b.innerHTML.includes('lucide-play')) { b.click(); }
    }
  });
  
  for (let i = 0; i < 15; i++) {
    if (extractedToken) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();

  if (extractedToken) {
    console.log('Testing premium movie pklj (ID 153, Source 130) with this token...');
    const premiumUrl = `https://admin168kh.com/api/streams/hls/movies/153/sources/130/master.m3u8?token=${extractedToken}`;
    const res = await fetch(premiumUrl, {
      headers: {
        'Referer': 'https://168kh.net/',
        'Origin': 'https://168kh.net'
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response snippet:', text.substring(0, 100));
  } else {
    console.log('Failed to extract token.');
  }
})();
