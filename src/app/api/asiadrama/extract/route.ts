class MockXMLHttpRequest {
  _method = 'GET';
  _url = '';
  _headers = new Headers();
  _body: any = null;
  onload: any = null;
  onerror: any = null;
  status = 0;
  statusText = '';
  response: any = null;
  responseText = '';
  responseURL = '';
  open(method: string, url: string) {
    this._method = method;
    this._url = url;
  }
  setRequestHeader(name: string, value: string) {
    this._headers.set(name, value);
  }
  getAllResponseHeaders() {
    let headersString = '';
    this._headers.forEach((v, k) => { headersString += `${k}: ${v}\r\n`; });
    return headersString;
  }
  send(body: any) {
    this._body = body;
    fetch(this._url, {
      method: this._method,
      headers: this._headers,
      body: this._body
    }).then(async (res) => {
      this.status = res.status;
      this.statusText = res.statusText;
      this.responseURL = res.url;
      const text = await res.text();
      this.responseText = text;
      this.response = text;
      this._headers = new Headers();
      res.headers.forEach((v, k) => { this._headers.set(k, v); });
      if (this.onload) this.onload();
    }).catch((err) => {
      if (this.onerror) this.onerror(err);
    });
  }
  abort() {}
}
const realGlobal = typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : {} as any);
if (!realGlobal.XMLHttpRequest) {
  realGlobal.XMLHttpRequest = MockXMLHttpRequest;
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const epsStr = searchParams.get('eps');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  let targetUrl = `https://asiadrama.net/${slug}/`;
  if (epsStr) {
    targetUrl += `?eps=${epsStr}`;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch page: ${res.status}` }, { status: res.status });
    }

    const html = await res.text();

    // 1. Extract episodes & video URLs from ant_tp / anc_tp divs
    const episodes: { id: string; name: string; url: string; active: boolean }[] = [];
    let videoUrl = '';

    const tpMatch = html.match(/id=["'](ant_tp|anc_tp)["'][^>]*>([\s\S]*?)(?:<\/div>|$)/i);
    if (tpMatch && tpMatch[2]) {
      const rawData = tpMatch[2].replace(/<br\s*\/?>/gi, '\n');
      const lines = rawData.split('|');
      const seenEps = new Set<string>();
      
      for (const line of lines) {
        const parts = line.trim().split(';');
        if (parts.length >= 2) {
          const rawDigits = parts[0].replace(/[^0-9]/g, '');
          if (!rawDigits) continue;
          const epNum = parseInt(rawDigits, 10).toString();
          const streamUrl = parts[1].trim();
          
          if (streamUrl.startsWith('http') && !seenEps.has(epNum)) {
            seenEps.add(epNum);
            
            let isMatch = false;
            if (epsStr) {
               if (epsStr === epNum || epsStr === parts[0].trim()) {
                  isMatch = true;
               } else {
                  // match `-<number>$` (e.g. tap-7, tap-17, but not tap-71 for epNum 7)
                  const exactRegex = new RegExp(`-${epNum}$`);
                  if (exactRegex.test(epsStr)) {
                     isMatch = true;
                  }
               }
            } else {
               isMatch = epNum === '1';
            }
            
            episodes.push({
              id: epNum,
              name: `Episode ${epNum}`,
              url: `?eps=tap-${epNum}`,
              active: isMatch,
            });
            if (isMatch) {
              videoUrl = streamUrl;
            }
          }
        }
      }
      if (!videoUrl && episodes.length > 0 && lines[0]) {
        const parts0 = lines[0].trim().split(';');
        if (parts0[1] && parts0[1].trim().startsWith('http')) {
          videoUrl = parts0[1].trim();
        }
      }
    }

    // Fallback: standard HTML matching if ant_tp wasn't found
    if (episodes.length === 0) {
      const epRegex = /<li[^>]*>\s*<a[^>]*href=["']([^"']+)["'][^>]*id=["']?([^"'\s>]*)["']?[^>]*class=["']?([^"'>]*)["']?[^>]*>(.*?)<\/a>/gi;
      let epMatch;
      const seenEps = new Set<string>();
      while ((epMatch = epRegex.exec(html)) !== null) {
        const href = epMatch[1];
        const id = epMatch[2] || '';
        const cls = epMatch[3] || '';
        const rawName = epMatch[4].replace(/<[^>]+>/g, '').trim();
        const epNumMatch = rawName.match(/\d+/);
        const epNum = epNumMatch ? epNumMatch[0] : rawName;
        
        if (href && (href.includes('eps=') || href.includes('/tap-') || href.includes('episode') || id.includes('tap'))) {
          if (!seenEps.has(epNum)) {
            seenEps.add(epNum);
            episodes.push({
              id,
              name: rawName,
              url: href,
              active: cls.includes('tap_active') || cls.includes('active'),
            });
          }
        }
      }
    }

    // Fallback: Dooplay AJAX fetching for movies that don't have ant_tp or standard episodes
    if (!videoUrl && episodes.length === 0) {
      const dooplayRegex = /<li[^>]*class=["'][^"']*dooplay_player_option[^"']*["'][^>]*data-type=["']([^"']+)["'][^>]*data-post=["']([^"']+)["'][^>]*data-nume=["']([^"']+)["']/i;
      const dooplayMatch = html.match(dooplayRegex);
      if (dooplayMatch) {
        const type = dooplayMatch[1];
        const post = dooplayMatch[2];
        const nume = dooplayMatch[3];
        try {
          const ajaxRes = await fetch('https://asiadrama.net/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: `action=doo_player_ajax&post=${post}&nume=${nume}&type=${type}`
          });
          if (ajaxRes.ok) {
            const ajaxData = await ajaxRes.json();
            if (ajaxData && ajaxData.embed_url) {
              videoUrl = ajaxData.embed_url;
              // Add a single episode so the player knows what it's playing
              episodes.push({
                id: '1',
                name: 'Full Movie',
                url: '?eps=1',
                active: true
              });
            }
          }
        } catch (e) {
          console.error("Dooplay AJAX error:", e);
        }
      }
    }

    if (!videoUrl) {
      const iframeMatches = html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi);
      for (const match of iframeMatches) {
        const src = match[1];
        if (src && !src.includes('ads') && !src.includes('google') && !src.includes('recaptcha') && !src.includes('doubleclick')) {
          videoUrl = src;
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      episodes,
      debug: ['Edge HTML parsing', `htmlLen:${html.length}`, `hasAntTp:${html.includes('ant_tp')}`, `hasAncTp:${html.includes('anc_tp')}`],
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Asiadrama Extraction Error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
