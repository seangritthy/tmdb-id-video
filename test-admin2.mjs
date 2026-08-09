import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  // Set User-Agent to match browser exactly
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  
  await page.goto('https://admin168kh.com/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'vdomov71@gmail.com');
  await page.type('input[type="password"]', 'Cambodia71#');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]).catch(e => console.log('Nav error:', e.message));
  
  const html = await page.content();
  console.log(html.includes('Dashboard') || html.includes('vdomov') ? 'Login Success!' : 'Login Failed.');
  
  if (html.includes('vdomov') || html.includes('Dashboard')) {
    const cookies = await page.cookies();
    const sessionCookie = cookies.find(c => c.name === '168kh-session' || c.name === 'XSRF-TOKEN');
    console.log('Session Cookie Found:', !!sessionCookie);
    
    // Now try to fetch the movie URL directly with the authenticated session
    console.log('Fetching movie data...');
    const uuid = '0196a91c-abde-47de-a2b1-4168feaab5c0'; // known UUID for hdhdh
    
    // In the frontend, the admin token is likely fetched from somewhere else. Let's look for it in the HTML.
    const tokenMatch = html.match(/token"?[ :]+["']([^"']{20,})["']/i) || html.match(/access_token"?[ :]+["']([^"']{20,})["']/i);
    console.log('Token found in HTML?', !!tokenMatch);
    if(tokenMatch) {
       console.log('Token:', tokenMatch[1].substring(0, 15) + '...');
    }
  } else {
    // Check for error messages
    const errorText = await page.evaluate(() => {
      const err = document.querySelector('.text-red-500, .text-danger, .error, [role="alert"]');
      return err ? err.textContent : null;
    });
    console.log('Error message on page:', errorText);
  }
  
  await browser.close();
})();
