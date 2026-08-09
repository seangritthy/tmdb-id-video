import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('request', req => {
    const url = req.url();
    if (url.includes('.m3u8')) console.log('M3U8:', url);
  });
  await page.goto('https://168kh.net/movies/hdhdh', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
