const puppeteer = require('puppeteer');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  
  const page = await browser.newPage();
  console.log('Navigating to 168kh.net...');
  await page.goto('https://168kh.net', { waitUntil: 'networkidle2' });
  
  console.log('Looking for login button...');
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
  
  console.log('Clicked login button?', clicked);
  if (clicked) {
    console.log('Waiting for modal to appear...');
    await new Promise(r => setTimeout(r, 2000));
    
    const inputs = await page.evaluate(() => 
      Array.from(document.querySelectorAll('input')).map(i => ({name: i.name, type: i.type}))
    );
    console.log('Inputs found:', inputs);
    
    await page.screenshot({ path: 'login_modal.png' });
    console.log('Saved screenshot to login_modal.png');
  }

  await browser.close();
})();
