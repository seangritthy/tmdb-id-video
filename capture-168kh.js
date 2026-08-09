const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('request', request => {
    const url = request.url();
    if (url.includes('admin168kh.com') || url.includes('.m3u8') || url.includes('/api/') || url.includes('token')) {
      console.log('REQ', url);
    }
  });
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('admin168kh.com') || url.includes('.m3u8') || url.includes('/api/') || url.includes('token')) {
      console.log('RES', response.status(), url);
      try {
        const text = await response.text();
        console.log('BODY-LEN', text.length);
      } catch (e) {
        console.log('BODY-ERR', e.message);
      }
    }
  });
  await page.goto('https://168kh.net/movies/hdhdh', { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForTimeout(15000);
  await browser.close();
})();
