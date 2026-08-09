import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new', // use new headless to test if it works without UI
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  let foundUrl = null;
  page.on('request', req => {
    const url = req.url();
    if (url.includes('.m3u8')) {
      foundUrl = url;
      console.log('FOUND:', url);
    }
  });

  console.log('Navigating to jeueh...');
  await page.goto('https://168kh.net/movies/jeueh', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait a bit for the page to initialize
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    // Try to click play if there is a play button
    console.log('Looking for play button...');
    const playBtn = await page.$('button[class*="play"], .vjs-big-play-button, .play-icon, #play-button, .jw-display-icon-display');
    if (playBtn) {
      console.log('Clicking play button...');
      await playBtn.click();
    } else {
       // just try clicking the center of the video area
       console.log('No specific play button found, clicking center...');
       await page.mouse.click(640, 360);
    }
  } catch (e) {
    console.log('Error clicking:', e.message);
  }

  // Wait up to 10 seconds for the request to be intercepted
  for (let i = 0; i < 10; i++) {
    if (foundUrl) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  if (foundUrl) {
    console.log('SUCCESS! Extracted URL:', foundUrl);
  } else {
    console.log('FAILED to extract URL.');
  }
  
  await browser.close();
})();
