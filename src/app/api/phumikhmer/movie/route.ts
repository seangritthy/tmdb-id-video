import '@/utils/xhr-polyfill';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function decodeHTML(html: string): string {
  return html.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#8211;/g,'\u2013').replace(/&#8212;/g,'\u2014').replace(/&#8216;/g,'\u2018').replace(/&#8217;/g,'\u2019').replace(/&#8220;/g,'\u201C').replace(/&#8221;/g,'\u201D').replace(/&#([0-9]+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&[a-z]+;/g,'');
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    // Step 1: Fetch the WP post to get the Blogger ID
    const wpResponse = await fetch(`https://www.phumikhmer.net/wp-json/wp/v2/posts/${id}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!wpResponse.ok) {
      const text = await wpResponse.text();
      throw new Error(`Failed to fetch WP post: ${wpResponse.status} ${text.substring(0, 100)}`);
    }

    const post = await wpResponse.json();
    const content = post.content.rendered;
    
    // Extract data-post-id from content
    const postIdMatch = content.match(/data-post-id=["']([^"']+)["']/i);
    const bloggerId = postIdMatch ? postIdMatch[1] : null;

    if (!bloggerId) {
        // Fallback: try to extract a video4khmer.khmerdrama.org link or iframe src from content
        const v4kMatch = content.match(/href=["'](https:\/\/video4khmer\.khmerdrama\.org\/[^"']+)["']/i);
        const iframeSrcMatch = content.match(/src=["'](https?:\/\/[^"']+(?:embed|player|watch|video)[^"']*?)["']/i);
        const anyIframeMatch = content.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        
        const fallbackUrl = v4kMatch?.[1] || iframeSrcMatch?.[1] || anyIframeMatch?.[1];
        
        // Decode HTML entities in title
        const rawTitle = post.title.rendered;
        const decodedTitle = decodeHTML(rawTitle);
        
        if (fallbackUrl) {
            if (fallbackUrl.includes("video4khmer.khmerdrama.org/tv-series/")) {
                try {
                    const slug = fallbackUrl.split('/').pop();
                    const v4kApiUrl = `https://video4khmer.khmerdrama.org/api/movies.php?find_slug=${slug}&paginated=1`;
                    const v4kRes = await fetch(v4kApiUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                    });
                    if (v4kRes.ok) {
                        const v4kData = await v4kRes.json();
                        if (v4kData.success && v4kData.data && v4kData.data.length > 0) {
                            const movieData = v4kData.data[0];
                            if (movieData.servers) {
                                const servers = JSON.parse(movieData.servers);
                                if (servers.length > 0 && servers[0].episodes && servers[0].episodes.length > 0) {
                                    const epsParam = searchParams.get('eps') || '1';
                                    let currentEpsIndex = parseInt(epsParam) - 1;
                                    
                                    const serverEps = servers[0].episodes;
                                    if (currentEpsIndex < 0 || currentEpsIndex >= serverEps.length) {
                                        currentEpsIndex = 0;
                                    }
                                    const streamUrl = serverEps[currentEpsIndex].url;

                                    const formattedEpisodes = serverEps.map((ep: any, index: number) => ({
                                        id: `${id}-ep${index + 1}`,
                                        name: `EP ${index + 1}`,
                                        url: `/khmer/player/${id}?type=PHUMIKHMER&eps=${index + 1}`,
                                        active: index === currentEpsIndex
                                    }));

                                    return NextResponse.json({
                                        id: id,
                                        title: decodedTitle,
                                        videoUrl: streamUrl,
                                        streamUrl: streamUrl,
                                        episodes: serverEps.length > 1 ? formattedEpisodes : []
                                    });
                                }
                            }
                        }
                    }
                } catch (v4kErr) {
                    console.error("Failed to parse v4k api", v4kErr);
                }
            }

            return NextResponse.json({
                id: id,
                title: decodedTitle,
                videoUrl: fallbackUrl, // will be rendered as iframe in the player
                streamUrl: fallbackUrl,
                episodes: []
            });
        }
        
        // Last resort: link directly to phumikhmer.net page for user to watch there
        return NextResponse.json({ 
            title: decodedTitle,
            episodes: [],
            error: 'No playable video source found for this movie'
        });
    }

    // Step 2: Fetch Blogger API to get video URLs
    const bloggerResponse = await fetch(`https://www.blogger.com/feeds/596013908374331296/posts/default/${bloggerId}?alt=json`, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
    });

    if (!bloggerResponse.ok) {
        throw new Error(`Failed to fetch Blogger post: ${bloggerResponse.status}`);
    }

    const bloggerData = await bloggerResponse.json();
    const bloggerContent = bloggerData.entry.content.$t;

    // Extract all URLs ending with type=.mp4 or containing .mp4
    const urlRegex = /https?:\/\/[^\s"'<>;]+type=\.mp4|https?:\/\/[^\s"'<>;]+\.mp4/gi;
    const matches = bloggerContent.match(urlRegex) || [];
    
    // Clean up URLs
    const streamUrls = [...new Set(matches.map((url: string) => {
        return url.replace(/;$/, '').trim();
    }))];

    // Decode HTML entities in title
    const rawTitle = post.title.rendered;
    const decodedTitle = decodeHTML(rawTitle);

    const epsParam = searchParams.get('eps') || '1';
    const currentEpsIndex = parseInt(epsParam) - 1;
    const streamUrl = streamUrls[currentEpsIndex] || streamUrls[0];

    const episodes = (streamUrls as string[]).map((url: string, index: number) => ({
        id: `${id}-ep${index + 1}`,
        name: `EP ${index + 1}`,
        url: `/khmer/player/${id}?type=PHUMIKHMER&eps=${index + 1}`,
        active: index === currentEpsIndex
    }));

    return NextResponse.json({
        id: id,
        title: decodedTitle,
        streamUrl: streamUrl,
        episodes: streamUrls.length > 1 ? episodes : []
    });

  } catch (error: any) {
    console.error('Error extracting PhumiKhmer movie:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract movie stream' }, { status: 500 });
  }
}
