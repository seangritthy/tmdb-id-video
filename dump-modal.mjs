import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://168kh.net', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    for (const b of btns) {
      if (b.innerText.includes('ចូលគណនី')) {
        b.click();
      }
    }
  });
  
  await page.waitForSelector('input[type="text"]');
  // Wait a little bit for the modal animation
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.content();
  fs.writeFileSync('modal.html', html);
  await browser.close();
})();
