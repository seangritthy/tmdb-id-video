const cheerio = require('cheerio');
fetch('https://www.phumikhmer.net/wp-json/wp/v2/posts/3824').then(r=>r.json()).then(post => {
  const content = post.content.rendered;
  const $ = cheerio.load(content);
  const bloggerId = $('#player').attr('data-post-id');
  return fetch('https://www.blogger.com/feeds/596013908374331296/posts/default/' + bloggerId + '?alt=json');
}).then(r=>r.json()).then(bloggerData => {
  const bloggerContent = bloggerData.entry.content['$t'];
  const urlRegex = /https?:\/\/[^\s"'<>;]+type=\.mp4|https?:\/\/[^\s"'<>;]+\.mp4/gi;
  const matches = bloggerContent.match(urlRegex) || [];
  const streamUrls = [...new Set(matches.map(url => url.replace(/;$/, '').trim()))];
  console.log("STREAM URLS", streamUrls);
}).catch(console.error);
