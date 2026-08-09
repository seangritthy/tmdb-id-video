import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://admin168kh.com/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'vdomov71@gmail.com');
  await page.type('input[type="password"]', 'Cambodia71#');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  
  await page.screenshot({path: 'login.png'});
  await browser.close();
})();
