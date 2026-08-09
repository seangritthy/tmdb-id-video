import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const cookies = [
    { name: '_ga', value: 'GA1.1.564394376.1784775604', domain: '.168kh.net' },
    { name: '_ga_NXC8BJ4DBX', value: 'GS2.1.s1784775603$o1$g1$t1784775620$j43$l0$h0', domain: '.168kh.net' },
    { name: 'auth_user', value: '%7B%22id%22%3A29589%2C%22name%22%3A%22vdomov%22%2C%22email%22%3A%22vdomov72%40gmail.com%22%2C%22phone%22%3Anull%2C%22avatar_url%22%3Anull%2C%22telegram_username%22%3Anull%2C%22preferred_locale%22%3A%22en%22%2C%22is_active%22%3Atrue%2C%22balance%22%3A0%2C%22credit_balance%22%3A20%7D', domain: '168kh.net' },
    { name: 'auth_device', value: '%7B%22id%22%3A34259%2C%22device_name%22%3A%22Windows%20PC%22%2C%22device_fingerprint%22%3A%225740313c484bf7b960930f62efa79df429d12ac183ce3799ff0f2d77e531b104%22%2C%22is_blocked%22%3Afalse%7D', domain: '168kh.net' }
  ];
  await page.setCookie(...cookies);

  page.on('request', req => {
    if (req.url().includes('api')) console.log('REQ:', req.url());
  });
  
  page.on('response', async res => {
    if (res.url().includes('api')) {
      try {
        const text = await res.text();
        console.log('RES:', res.url(), text.substring(0, 500));
      } catch(e){}
    }
  });

  await page.goto('https://168kh.net/movies/hdhdh', { waitUntil: 'networkidle2' });
  
  const btns = await page.$$('button');
  for (const b of btns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('token')) {
      console.log('Clicking button:', text);
      await b.click();
      await new Promise(r => setTimeout(r, 3000));
      break;
    }
  }

  await browser.close();
})();
