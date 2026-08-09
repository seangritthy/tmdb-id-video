const puppeteer = require('puppeteer');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating to 168kh.net...');
  await page.goto('https://168kh.net', { waitUntil: 'networkidle2' });
  
  await page.screenshot({ path: 'step1.png' });
  
  console.log('Clicking login...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.innerText.includes('ចូលគណនី')) {
        b.click();
        return;
      }
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'step2.png' });
  
  console.log('Typing credentials...');
  await page.type('input[type="text"]', process.env.KH168_EMAIL);
  await page.type('input[type="password"]', process.env.KH168_PASSWORD);
  await page.screenshot({ path: 'step3.png' });
  
  console.log('Submitting...');
  await page.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'step4.png' });
  
  await browser.close();
})();
