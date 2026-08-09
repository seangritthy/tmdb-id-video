import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const referer = searchParams.get("referer") || "https://www.phumikhmer.net/";

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        'Referer': referer,
        'Origin': new URL(referer).origin,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch from target: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Inject base tag for relative assets
      const baseUrl = new URL(url).origin;
      html = html.replace(/<head>/i, `<head><base href="${baseUrl}/"><meta name="referrer" content="no-referrer">`);

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }

    // If it's not HTML, just proxy it directly
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding'); // Let Edge handle encoding
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error: any) {
    console.error('Iframe Proxy Error:', error);
    return new NextResponse(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
