import '@/utils/xhr-polyfill';
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Cap how much of an upstream file we ever fetch in a single Worker invocation.
// Video elements often issue an open-ended Range (e.g. "bytes=0-"), which — if
// forwarded as-is — asks the upstream to send the ENTIRE file (can be 100s of MB).
// Streaming that through a single Cloudflare Worker execution can exceed the
// platform's CPU/time limits (Error 1102: "Worker exceeded resource limits"),
// aborting the connection mid-transfer and breaking playback. Bounding the range
// keeps each request small; the <video>/hls.js client will simply issue further
// range requests as playback progresses.
const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get("url");

  if (!streamUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const referer = searchParams.get("referer") || "";
  const isPlaylist = streamUrl.includes('.m3u8');

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": referer,
      "Origin": new URL(referer).origin
    };

    const rangeHeader = request.headers.get("range");
    if (isPlaylist) {
      // Playlists are tiny text files — no need to bound, just pass through.
      if (rangeHeader) headers["Range"] = rangeHeader;
    } else {
      const match = rangeHeader?.match(/^bytes=(\d+)-(\d*)$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const requestedEnd = match[2] ? parseInt(match[2], 10) : undefined;
        const end = requestedEnd !== undefined ? Math.min(requestedEnd, start + CHUNK_SIZE - 1) : start + CHUNK_SIZE - 1;
        headers["Range"] = `bytes=${start}-${end}`;
      } else {
        // No (parseable) range requested — still bound the first chunk instead of
        // letting the upstream stream back the whole file.
        headers["Range"] = `bytes=0-${CHUNK_SIZE - 1}`;
      }
    }

    const response = await fetch(streamUrl, { headers });

    const responseHeaders = new Headers();
    
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("Content-Type", contentType);

    const contentRange = response.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    const acceptRanges = response.headers.get("accept-ranges");
    if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);

    const contentLength = response.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    // Allow browser video element to load from this proxy
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range");

    // If it is a playlist, rewrite the URLs
    if (streamUrl.includes('.m3u8') || contentType?.includes('mpegurl')) {
      let bodyText = await response.text();
      const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
      
      const lines = bodyText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#')) {
          let absoluteUrl = line;
          if (!line.startsWith('http')) {
            absoluteUrl = line.startsWith('/') 
              ? new URL(line, streamUrl).href 
              : baseUrl + line;
          }
          // Proxy EVERYTHING (.m3u8 and .ts) through our Edge proxy to bypass IP blocks
          lines[i] = `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
        }
      }
      bodyText = lines.join('\n');
      responseHeaders.set("Content-Length", new TextEncoder().encode(bodyText).byteLength.toString());
      
      return new NextResponse(bodyText, {
        status: response.status,
        headers: responseHeaders
      });
    }

    // If it's a binary file (like a .ts chunk), just stream the body directly using Edge runtime!
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error("Stream proxy error:", err);
    return new NextResponse("Error proxying stream: " + err.message, { status: 500 });
  }
}
