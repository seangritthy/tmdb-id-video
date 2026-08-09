import '@/utils/xhr-polyfill';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

function decodeHTML(html: string): string {
  return html.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#8211;/g,'\u2013').replace(/&#8212;/g,'\u2014').replace(/&#8216;/g,'\u2018').replace(/&#8217;/g,'\u2019').replace(/&#8220;/g,'\u201C').replace(/&#8221;/g,'\u201D').replace(/&#([0-9]+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&[a-z]+;/g,'');
}
interface PhumiKhmerMovie {
  id: string;
  title: string;
  posterUrl: string;
  url: string;
  slug: string;
  year: string;
  type: string;
  rating?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const categoryId = searchParams.get('category') || 'all';

    let targetUrl = `https://www.phumikhmer.net/wp-json/wp/v2/posts?per_page=${limit}&page=${page}`;

    if (search) {
      targetUrl += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) {
      if (response.status === 400) {
          return NextResponse.json({ movies: [], totalItems: 0, currentPage: parseInt(page) });
      }
      throw new Error(`Failed to fetch from PhumiKhmer: ${response.status} ${response.statusText}`);
    }

    const totalPages = response.headers.get('X-WP-TotalPages') || '1';
    const totalItems = response.headers.get('X-WP-Total') || '0';

    const posts = await response.json();

    const movies: PhumiKhmerMovie[] = posts.map((post: any) => {
      const rawTitle = post.title.rendered;
      const decodedTitle = decodeHTML(rawTitle);
      
      let posterUrl = post.aioseo_meta_data?.og_image_url || post.yoast_head_json?.og_image?.[0]?.url;
      
      if (!posterUrl) {
          const imgMatch = post.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
          posterUrl = imgMatch ? imgMatch[1] : '';
      }

      const year = post.date ? new Date(post.date).getFullYear().toString() : '';

      return {
        id: `phumi-${post.id}`, // Fallback unmapped ID so isUnmapped is true
        title: decodedTitle,
        posterUrl: posterUrl,
        url: post.link,
        slug: post.id.toString(), // Use WP post ID as the slug
        year: year,
        type: 'PHUMIKHMER'
      };
    });

    // TMDB Mapping
    const tmdbToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZTEwYmYwNmU0ZjE1ZGFlNmU5ZmYzNWZmMzVlOGRmMiIsIm5iZiI6MTc0MzYwNjI3My45NjIsInN1YiI6IjY3ZWQ1MjAxODM2YzhlZGE3Y2FhZjc4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.S3sKVtyFQ0kWZRrE4bVGGtw7VAHiEQ2cPUHmFlmmRrg";
    const mappedMovies = await Promise.all(
      movies.map(async (movie: any) => {
        if (!tmdbToken) return movie;
        try {
          // Clean title: "Nisaiy Sne Piphob Nakleng និស្ស័យស្នេហ៍ពិភពអ្នកលេង - Rose Martial World"
          // We can just use the English parts if possible, or search the whole title.
          const cleanTitle = movie.title.split('-')[0].trim();
          const searchRes = await fetch(
            `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(cleanTitle)}`,
            { headers: { Authorization: `Bearer ${tmdbToken}` } }
          );
          if (searchRes.ok) {
            const tmdbData = await searchRes.json();
            if (tmdbData.results && tmdbData.results.length > 0) {
              const validResult = tmdbData.results.find((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
              if (validResult) {
                return { ...movie, id: validResult.id.toString() }; 
              }
            }
          }
        } catch (e) {
          // ignore tmdb errors
        }
        return movie;
      })
    );

    return NextResponse.json({
      movies: mappedMovies,
      totalItems: parseInt(totalItems),
      totalPages: parseInt(totalPages),
      currentPage: parseInt(page),
      hasMore: parseInt(page) < parseInt(totalPages)
    });
  } catch (error) {
    console.error('Error in PhumiKhmer API:', error);
    return NextResponse.json({ error: 'Failed to fetch movies from PhumiKhmer' }, { status: 500 });
  }
}
