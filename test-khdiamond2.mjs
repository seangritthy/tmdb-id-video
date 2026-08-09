import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function main() {
  const html = await fetch('https://khdiamond.net/movies/page/1/').then(r=>r.text());
  const $ = cheerio.load(html);
  
  const movies = [];
  $('article.item.movies, article.item.tvshows').each((i, el)=>{
    const a = $(el).find('.poster a');
    const href = a.attr('href');
    const img = a.find('img').attr('src');
    const title = $(el).find('.data h3 a').text();
    const year = $(el).find('.data span').text();
    movies.push({ href, img, title, year });
  });
  console.log(JSON.stringify(movies.slice(0,2), null, 2));
}

main().catch(console.error);
