import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function main() {
  const html = await fetch('https://www.phumikhmer.net/nisaiy-sne-piphob-nakleng/').then(r=>r.text());
  const $ = cheerio.load(html);
  $('script').each((i, el)=>{
    const text = $(el).html();
    if (text && (text.includes('jwplayer') || text.includes('crypto') || text.includes('player'))) {
      console.log('--- SCRIPT ---\n' + text);
    }
  });
}
main().catch(console.error);
