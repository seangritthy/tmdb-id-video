import '@/utils/xhr-polyfill';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const category = searchParams.get('category') || 'tvshows';
    let basePath = '';
    
    switch (category) {
      case 'movies':
        basePath = 'movies';
        break;
      case 'chinese-drama':
        basePath = 'genre/chinese-drama';
        break;
      case 'korean-drama':
        basePath = 'genre/korean-drama';
        break;
      case 'tvshows':
      default:
        basePath = 'tvshows';
        break;
    }
    
    const targetUrl = page === '1' 
      ? `https://asiadrama.net/${basePath}/` 
      : `https://asiadrama.net/${basePath}/page/${page}/`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Strip script/style blocks to avoid browser-only APIs in inline scripts
    const cleanHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '');
    
    const movies: any[] = [];
    const articleRegex = /<article[^>]*class=["'][^"']*item[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    
    while ((match = articleRegex.exec(cleanHtml)) !== null) {
      const articleHtml = match[1];
      
      const linkMatch = articleHtml.match(/<a href="([^"]+)"/i);
      const imgMatch = articleHtml.match(/<img src="([^"]+)"/i);
      const titleMatch = articleHtml.match(/<h3[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/h3>/i);
      const dateMatch = articleHtml.match(/<span>([^<]+)<\/span>/i);
      const typeMatch = articleHtml.match(/<span class="item_type">([^<]+)<\/span>/i);
      
      if (linkMatch && titleMatch) {
        const url = linkMatch[1];
        let slug = url.replace('https://asiadrama.net/', '');
        if (slug.endsWith('/')) slug = slug.slice(0, -1);
        const posterUrl = imgMatch ? imgMatch[1] : '';
        
        const excludedSlugs = [
          'tvshows/youtube-premium',
          'tvshows/gmail-account',
          'tvshows/telegram-premium',
          'tvshows/netflix-account',
          'tvshows/spotify-premium'
        ];
        
        if (!excludedSlugs.includes(slug)) {
          const movieObj = {
            id: slug.replace(/\//g, '-'),
            title: titleMatch[1].trim(),
            posterUrl,
            url,
            slug,
            year: dateMatch ? dateMatch[1] : '',
            type: typeMatch ? typeMatch[1] : 'MOVIE',
          };

          const existingIndex = movies.findIndex(m => m.slug === slug);
          if (existingIndex >= 0) {
            if (movies[existingIndex].posterUrl.includes('dt_backdrop') && !posterUrl.includes('dt_backdrop')) {
              movies[existingIndex] = movieObj;
            }
          } else {
            movies.push(movieObj);
          }
        }
      }
    }
    
    const tmdbToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZTEwYmYwNmU0ZjE1ZGFlNmU5ZmYzNWZmMzVlOGRmMiIsIm5iZiI6MTc0MzYwNjI3My45NjIsInN1YiI6IjY3ZWQ1MjAxODM2YzhlZGE3Y2FhZjc4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.S3sKVtyFQ0kWZRrE4bVGGtw7VAHiEQ2cPUHmFlmmRrg";
    const categoryType = category === 'movies' ? 'MOVIE' : 'TV';

    // Batched TMDB mapping to balance speed and Cloudflare's concurrent request limits
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const results = [];
      for (let i = 0; i < arr.length; i += size) {
        results.push(arr.slice(i, i + size));
      }
      return results;
    };

    const mappedMovies: any[] = [];
    const chunks = chunkArray(movies, 6); // 6 concurrent requests per batch

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (movie) => {
          movie.type = categoryType;
          if (!tmdbToken) return movie;
          try {
            const cleanTitle = movie.title.split('-')[0].trim();
            const searchRes = await fetch(
              `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(cleanTitle)}`,
              { 
                headers: { Authorization: `Bearer ${tmdbToken}` },
                next: { revalidate: 86400 } // Cache TMDB responses for 24h
              }
            );
            if (searchRes.ok) {
              const data = await searchRes.json();
              if (data.results && data.results.length > 0) {
                const validResult = data.results.find((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
                if (validResult) {
                  return { ...movie, id: validResult.id.toString() };
                }
              }
            }
          } catch (e) {
            // ignore TMDB errors per movie
          }
          return movie;
        })
      );
      mappedMovies.push(...chunkResults);
    }
    
    let totalPages = 1;
    const pagesMatch = cleanHtml.match(/<span>Page \d+ of (\d+)<\/span>/i);
    if (pagesMatch) {
      totalPages = parseInt(pagesMatch[1], 10);
    } else {
      const pageLinks = [...cleanHtml.matchAll(/page\/(\d+)/g)].map(m => parseInt(m[1], 10));
      if (pageLinks.length > 0) {
        totalPages = Math.max(...pageLinks);
      }
    }
    const totalItems = totalPages > 0 ? (totalPages - 1) * 30 + movies.length : movies.length;

    return NextResponse.json({ 
      movies: mappedMovies, 
      page: parseInt(page as string),
      totalPages,
      totalItems 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
