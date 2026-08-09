import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  const urls = [];
  page.on('request', req => {
    urls.push(req.url());
  });

  await page.goto('https://168kh.net/movies/jeueh', { waitUntil: 'networkidle0', timeout: 15000 });
  
  fs.writeFileSync('all-requests.json', JSON.stringify(urls, null, 2));
  console.log('Saved all requests to all-requests.json');
  await browser.close();
})();
