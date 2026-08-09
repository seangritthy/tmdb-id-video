import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  console.log('Navigating to admin login...');
  await page.goto('https://admin168kh.com/login', { waitUntil: 'networkidle2' });
  
  console.log('Typing credentials...');
  // Find email and password inputs
  await page.type('input[type="email"]', 'vdomov71@gmail.com');
  await page.type('input[type="password"]', 'Cambodia71#');
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => console.log('No navigation'));
  
  const cookies = await page.cookies();
  console.log('Cookies:', cookies.map(c => c.name + '=' + c.value).join('; '));
  
  const html = await page.content();
  console.log('Logged in?', html.includes('vdomov') || html.includes('Dashboard') ? 'YES' : 'NO');
  if(!html.includes('vdomov') && !html.includes('Dashboard')) {
     console.log('Trying vdomov72...');
     await page.goto('https://admin168kh.com/login', { waitUntil: 'networkidle2' });
     await page.evaluate(() => document.querySelector('input[type="email"]').value = '');
     await page.type('input[type="email"]', 'vdomov72@gmail.com');
     await page.type('input[type="password"]', 'Cambodia71#');
     await page.click('button[type="submit"]');
     await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
     const html2 = await page.content();
     console.log('Logged in 72?', html2.includes('vdomov') || html2.includes('Dashboard') ? 'YES' : 'NO');
     const cookies2 = await page.cookies();
     console.log('Cookies 72:', cookies2.map(c => c.name + '=' + c.value).join('; '));
  }
  
  await browser.close();
})();
