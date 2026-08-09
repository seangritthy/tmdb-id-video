const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    
    // Listen for console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    console.log('Navigating to player page...');
    await page.goto('http://localhost:3002/khmer/player/4091?slug=movies/babylon-a-d-2008&eps=', { waitUntil: 'networkidle2' });
    
    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'screenshot1.png' });
    
    // Check if ads warning is present
    const btn = await page.$('button[color="danger"]');
    if (btn) {
      console.log('Ads warning found. Clicking it...');
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('Taking screenshot after clicking warning...');
      await page.screenshot({ path: 'screenshot2.png' });
    } else {
      console.log('No ads warning button found.');
    }

    console.log('Waiting for video or iframe...');
    await new Promise(r => setTimeout(r, 10000)); // wait 10s for extraction
    
    console.log('Taking final screenshot...');
    await page.screenshot({ path: 'screenshot3.png' });
    
    await browser.close();
    console.log('Test completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
