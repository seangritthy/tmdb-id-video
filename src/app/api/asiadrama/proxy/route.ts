import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return new NextResponse('Slug is required', { status: 400 });
    }

    const targetUrl = `https://asiadrama.net/${slug}/`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch from asiadrama: ${response.status}`, { status: response.status });
    }

    let html = await response.text();

    // Inject base tag for relative assets
    html = html.replace(/<head>/i, '<head><base href="https://asiadrama.net/">');

    // Remove scripts that cause ad popups if we can identify them (optional)
    html = html.replace(/<script[^>]*src=["'][^"']*vignette[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<script[^>]*src=["'][^"']*googlesyndication[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');

    // Force dark mode classes if any exist, and force transparent backgrounds on iframes
    html = html.replace(/<body([^>]*)class=["']([^"']*)light([^"']*)["']/gi, '<body$1class="$2dark$3"');
    if (!html.match(/<body[^>]*class=["'][^"']*dark[^"']*["']/i)) {
       html = html.replace(/<body([^>]*)>/i, '<body$1 class="dark">');
    }
    
    html = html.replace(/<iframe([^>]*)>/gi, '<iframe$1 allowtransparency="true" style="background-color: #000000;">');

    // Inject custom CSS to match VDOMov style and hide unwanted elements
    const customStyle = `
      <style>
        /* Hide Asiadrama branding, headers, footers, sidebars, and ads */
        header, footer, #header, #footer, .sidebar, #sidebar, .module_home_ads, #popupAd, .head-main-nav, .starstruck-wrap, .social-links, #disqus_thread, .comment-respond {
          display: none !important;
        }

        /* Match VDOMov Theme */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body, html, #dt_contenedor, #contenedor {
          background-color: #0a0f16 !important;
          color: #ffffff !important;
          font-family: 'Inter', sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Adjust main container to fill screen */
        /* Hide specific banner elements aggressively */
        .video-player img, #player-container img { opacity: 0 !important; pointer-events: none !important; }
      </style>
      
      <script>
        // Clean up UI safely
        setInterval(() => {
          document.querySelectorAll('iframe').forEach(iframe => {
            if(iframe.src.includes('ads') || iframe.src.includes('banner')) {
              iframe.style.display = 'none';
            }
          });
        }, 500);
      </script>

      <style>
        :root, body, html {
          color-scheme: dark !important;
        }

        #contenedor {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 10px !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        #single {
          background: transparent !important;
        }
        
        iframe, #play-video, .video-player, #player-container {
          background-color: #000000 !important;
          color-scheme: dark !important;
        }
        
        #single {
          background: transparent !important;
        }

        /* Style the player container */
        .playex {
          background-color: #111823 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          margin-bottom: 20px !important;
          box-shadow: 0 4px 30px rgba(0,0,0,0.5) !important;
        }

        /* Style titles and text */
        h1, h2, h3, h4, h5, h6, .sbox h1, .sbox h2, .sheader .data h1 {
          color: #ffffff !important;
          font-weight: 700 !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        /* Style episode lists */
        ul.episodios {
          background: #111823 !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 15px !important;
        }

        ul.episodios li {
          background: rgba(255,255,255,0.05) !important;
          border-bottom: none !important;
          margin-bottom: 8px !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        ul.episodios li:hover {
          background: rgba(0, 229, 255, 0.1) !important;
          border: 1px solid rgba(0, 229, 255, 0.3) !important;
        }

        ul.episodios li a {
          color: #e0e0e0 !important;
        }

        ul.episodios li:hover a {
          color: #00e5ff !important;
        }

        /* Style buttons / options */
        .options {
          background: #111823 !important;
          border-radius: 8px !important;
        }

        .options ul li {
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
          border-radius: 4px !important;
        }

        .options ul li.active {
          background: #00e5ff !important;
          color: #000 !important;
        }
        
        /* Style the overview / description */
        .wp-content {
          color: #a1a1aa !important;
          line-height: 1.6 !important;
          font-size: 15px !important;
        }
        
        /* Style posters inside details */
        .sheader .poster img {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }

        /* Metadata items */
        .sbox .custom_fields b.variante {
          color: #00e5ff !important;
          font-weight: 600 !important;
        }
        .sbox .custom_fields span.valor {
          color: #a1a1aa !important;
        }

        a {
          color: #00e5ff !important;
        }
      </style>
    `;

    html = html.replace(/<\/head>/i, customStyle + '</head>');

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error: any) {
    console.error('Asiadrama Proxy Error:', error);
    return new NextResponse(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
