import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

const RCP_RE = /(cloudorchestranova|cloudnestra)\.com\/(rcp|prorcp)\/[A-Za-z0-9+/=_-]+/i;

const EMBED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://vsembed.ru/",
};

// Free public relays that fetch a target URL from THEIR IP (not ours) and
// return the raw body. This routes around vsembed's Cloudflare 1020 ban.
const RELAYS = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
];

async function fetchText(url: string, timeoutMs = 10000): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: EMBED_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchRcpDirect(embedUrl: string): Promise<string | null> {
  // 1) Direct
  let html = await fetchText(embedUrl, 8000);
  let m = html && html.match(RCP_RE);
  if (m) return m[0];

  // 2) Via relays
  for (const relay of RELAYS) {
    html = await fetchText(relay(embedUrl), 12000);
    m = html && html.match(RCP_RE);
    if (m) return m[0];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdb = searchParams.get("tmdb");
  const type = searchParams.get("type"); // 'movie' or 'tv'
  const season = searchParams.get("season") || "1";
  const episode = searchParams.get("episode") || "1";

  if (!tmdb) {
    return NextResponse.json({ error: "TMDB ID is required" }, { status: 400 });
  }

  const embedUrl =
    type === "tv"
      ? `https://vsembed.ru/embed/tv/${tmdb}/${season}/${episode}`
      : `https://vsembed.ru/embed/movie/${tmdb}/`;

  try {
    const rcpPath = await fetchRcpDirect(embedUrl);

    if (rcpPath) {
      const fullUrl = rcpPath.startsWith("http") ? rcpPath : `https://${rcpPath}`;
      // Return HTML that strips the Referer header before redirecting
      // CloudNestra blocks requests with a local/wrong referer, but allows empty referers.
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="refresh" content="0;url=${fullUrl}">
  <style>body{background:#000;}</style>
</head>
<body></body>
</html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Fallback: If extraction fails, just redirect to the original vsembed URL
    return NextResponse.redirect(embedUrl);
  } catch (error) {
    console.error("[orchestra extraction error]:", error);
    // Fallback on error
    return NextResponse.redirect(embedUrl);
  }
}

