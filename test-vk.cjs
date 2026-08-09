const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // A public VK embed URL (just an example, hopefully still alive)
  const vkUrl = 'https://vk.com/video_ext.php?oid=-22822305&id=456239018&hash=2f24db21d0a5e81d';
  
  await page.goto(vkUrl, { waitUntil: 'networkidle2' });
  
  const videoSrc = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video ? video.src : null;
  });
  
  console.log("Extracted video source:", videoSrc);
  await browser.close();
})();
