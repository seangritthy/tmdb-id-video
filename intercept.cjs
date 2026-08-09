const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('request', request => {
    if (request.url().includes('admin168kh.com') || request.url().includes('m3u8')) {
      console.log('->', request.method(), request.url());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('admin168kh.com') || response.url().includes('m3u8')) {
      console.log('<-', response.status(), response.url());
      if (response.url().includes('api') && response.headers()['content-type']?.includes('json')) {
        try {
          const text = await response.text();
          console.log('   Response preview:', text.substring(0, 300));
        } catch (e) {}
      }
    }
  });

  console.log("Navigating to https://168kh.net/movie/1911");
  await page.goto('https://168kh.net/movie/1911', { waitUntil: 'networkidle2' });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
})();
