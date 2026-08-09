import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function main() {
  const html = await fetch('https://khdiamond.net/movies/page/1/').then(r=>r.text());
  const $ = cheerio.load(html);
  
  const movies = [];
  $('article.item.movies').each((i, el)=>{
    const a = $(el).find('.poster a');
    movies.push({ href: a.attr('href'), title: $(el).find('.data h3 a').text() });
  });
  
  for (const m of movies.slice(0, 5)) {
    const mHtml = await fetch(m.href).then(r=>r.text());
    const m$ = cheerio.load(mHtml);
    const hasWallet = mHtml.includes('wallet_purchase-js-extra');
    const playerOptions = m$('.dooplay-player-option').length;
    const iframes = m$('iframe').length;
    console.log(m.title, '- Wallet:', hasWallet, 'Options:', playerOptions, 'Iframes:', iframes);
  }
}

main().catch(console.error);
