import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function main() {
  const html = await fetch('https://www.phumikhmer.net/nisaiy-sne-piphob-nakleng/').then(r=>r.text());
  const $ = cheerio.load(html);
  $('script').each((i, el)=>{
    const src = $(el).attr('src');
    if (src) console.log(src);
  });
}

main().catch(console.error);
