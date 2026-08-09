import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function main() {
  const html = await fetch('https://khdiamond.net/').then(r=>r.text());
  const $ = cheerio.load(html);
  
  console.log('--- HOMEPAGE POSTS ---');
  // Usually WordPress posts are in articles or divs with classes like 'post', 'item', 'hentry'
  const posts = [];
  $('article, .item, .post').each((i, el) => {
    const title = $(el).find('h1, h2, h3, .title').text().trim();
    const link = $(el).find('a').attr('href');
    const image = $(el).find('img').attr('src');
    if (title && link) {
      posts.push({title, link, image});
    }
  });
  
  if (posts.length === 0) {
      // Fallback to all links with an image
      $('a').each((i, el) => {
          const title = $(el).attr('title') || $(el).text().trim();
          const href = $(el).attr('href');
          const img = $(el).find('img').attr('src');
          if (href && img && href.includes('khdiamond.net')) {
              posts.push({ title, link: href, image: img });
          }
      });
  }
  
  console.log(posts.slice(0, 5));
  
  if (posts.length > 0 && posts[0].link) {
      console.log('\n--- FETCHING POST:', posts[0].link, '---');
      const postHtml = await fetch(posts[0].link).then(r=>r.text());
      const post$ = cheerio.load(postHtml);
      
      const iframes = [];
      post$('iframe').each((i, el) => {
          iframes.push(post$(el).attr('src'));
      });
      console.log('Iframes found:', iframes);
      
      // Look for any obvious stream URLs
      const match = postHtml.match(/https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)/gi);
      console.log('Stream URLs found in HTML:', match);
  }
}

main().catch(console.error);
