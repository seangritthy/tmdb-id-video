"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import { Skeleton, Button, Spinner } from "@heroui/react";
import Carousel from "@/components/ui/wrapper/Carousel";
import SectionTitle from "@/components/ui/other/SectionTitle";

interface AsiadramaMovie {
  id: string;
  title: string;
  posterUrl: string;
  url: string;
  slug: string;
  year: string;
  type: string;
  rating?: string;
}

import { Battambang } from "@/utils/fonts";
import { Link } from "@heroui/react";

const CATEGORIES = [
  { id: "tvshows", title: "រឿងភាគនិយាយខ្មែរ" },
  { id: "chinese-drama", title: "រឿងភាគចិននិយាយខ្មែរ" },
  { id: "korean-drama", title: "រឿងភាគកូរ៉េនិយាយខ្មែរ" },
  { id: "movies", title: "ភាពយន្តនិយាយខ្មែរ" }
];

import { Tab, Tabs } from "@heroui/react";

import { useDictionary } from "@/components/providers/DictionaryProvider";

const KhmerCategorySection = ({ category, source = "asiadrama" }: { category: { id: string, title: string }, source?: string }) => {
  const dictionary = useDictionary();
  const [movies, setMovies] = useState<AsiadramaMovie[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        let apiPath = `/api/asiadrama?category=${category.id}`;
        if (source === "phumikhmer") {
          apiPath = `/api/phumikhmer?category=${category.id}`;
        }
        
        const fetchPromises = [
          fetch(`${apiPath}&page=1`),
          fetch(`${apiPath}&page=2`)
        ];

        const responses = await Promise.all(fetchPromises);
        const dataArr = await Promise.all(responses.map(r => r.json()));
        
        setTotalItems(dataArr[0].totalItems || 0);

        const combined = dataArr.flatMap(data => data.movies || []);
        
        // Deduplicate by slug
        const uniqueMovies: AsiadramaMovie[] = [];
        const seenSlugs = new Set();
        for (const m of combined) {
          if (!seenSlugs.has(m.slug)) {
            seenSlugs.add(m.slug);
            uniqueMovies.push(m);
          }
        }
        setMovies(uniqueMovies);
      } catch (error) {
        console.error(`Failed to fetch ${category.id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategory();
  }, [category.id, source]);

  return (
    <section className="min-h-[250px] md:min-h-[300px] mb-12">
      {isLoading ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <div className="flex items-center gap-3">
              <SectionTitle className={Battambang.className}>{category.title}</SectionTitle>
              {totalItems > 0 && (
                <span className="text-sm font-medium text-default-500 bg-default-100 px-2 py-1 rounded-md">
                  Total: {totalItems}+
                </span>
              )}
            </div>
            {source === "asiadrama" && (
              <Link
                size="sm"
                href={`/khmer/category/${category.id}`}
                isBlock
                color="foreground"
                className="rounded-full"
              >
                {dictionary.viewAll} &gt;
              </Link>
            )}
          </div>
          <Carousel>
            {movies.map((movie, index) => {
              const mockTmdbMovie: any = {
                id: movie.id, // Using TMDB ID mapped from API
                title: movie.title,
                original_title: movie.title,
                release_date: movie.year ? `${movie.year}-01-01` : "2024-01-01",
                poster_path: movie.posterUrl,
                vote_average: movie.rating ? parseFloat(movie.rating) : 0,
                adult: false,
                original_language: "km",
              };
              let playerType = movie.type;
              if (source === "phumikhmer") playerType = "PHUMIKHMER";
              
              return (
                <div key={`${movie.slug}-${index}`} className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2">
                  <MoviePosterCard 
                    movie={mockTmdbMovie} 
                    href={`/khmer/player/${movie.id}?slug=${movie.slug}&type=${playerType}`}
                    disableHover
                  />
                </div>
              );
            })}
          </Carousel>
        </div>
      )}
    </section>
  );
};

// ─── PhumiKhmer full grid with infinite scroll ───────────────────────────────
const PhumiKhmerGrid = () => {
  const [movies, setMovies] = useState<AsiadramaMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchMovies = useCallback(async (pageNum: number, searchQuery: string, append = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = new URLSearchParams({ page: pageNum.toString(), limit: "20" });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/phumikhmer?${params}`);
      const data = await res.json();

      if (append) {
        setMovies(prev => {
          const slugs = new Set(prev.map(m => m.slug));
          const newOnes = (data.movies || []).filter((m: AsiadramaMovie) => !slugs.has(m.slug));
          return [...prev, ...newOnes];
        });
      } else {
        setMovies(data.movies || []);
      }
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      setPage(pageNum);
    } catch (e) {
      console.error("PhumiKhmer fetch error:", e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMovies(1, "");
  }, [fetchMovies]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoadingMore && !isLoading && page < totalPages) {
        fetchMovies(page + 1, search, true);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoadingMore, isLoading, page, totalPages, search, fetchMovies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchMovies(1, searchInput, false);
  };

  const skeletons = Array.from({ length: 12 });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SectionTitle className={Battambang.className}>ភូមិខ្មែរ · PhumiKhmer</SectionTitle>
          {totalItems > 0 && (
            <span className="text-sm font-medium text-default-500 bg-default-100 px-2 py-1 rounded-md">
              {totalItems}+ រឿង
            </span>
          )}
        </div>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="ស្វែងរករឿង..."
            className="px-4 py-2 rounded-xl bg-default-100 border border-default-200 text-sm text-foreground placeholder-default-400 focus:outline-none focus:border-primary transition-colors w-52"
          />
          <Button type="submit" color="primary" size="sm" radius="lg" className="font-semibold">
            ស្វែងរក
          </Button>
        </form>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {skeletons.map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[2/3] rounded-xl" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-default-400 gap-3">
          <span className="text-5xl">🎬</span>
          <p className="text-lg font-medium">មិនមានរឿងទេ</p>
          {search && (
            <Button size="sm" variant="flat" onPress={() => { setSearchInput(""); setSearch(""); fetchMovies(1, "", false); }}>
              សម្អាតការស្វែងរក
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {movies.map((movie, index) => {
              const mockTmdbMovie: any = {
                id: movie.id,
                title: movie.title,
                original_title: movie.title,
                release_date: movie.year ? `${movie.year}-01-01` : "2024-01-01",
                poster_path: movie.posterUrl,
                vote_average: 0,
                adult: false,
                original_language: "km",
              };
              return (
                <MoviePosterCard
                  key={`${movie.slug}-${index}`}
                  movie={mockTmdbMovie}
                  href={`/khmer/player/${movie.id}?slug=${movie.slug}&type=PHUMIKHMER`}
                  disableHover
                />
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="flex justify-center py-6">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-default-400">
                <Spinner size="sm" color="primary" />
                <span className="text-sm">កំពុងផ្ទុក...</span>
              </div>
            ) : page >= totalPages ? (
              <p className="text-sm text-default-400">បានបញ្ចប់ · {movies.length} រឿង</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

const KhmerDubbedPage = () => {
  const [selectedSource, setSelectedSource] = useState("asiadrama");

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Khmer Home</h1>
          <p className="text-muted-foreground mt-2">Watch the latest Khmer Asian dramas and movies.</p>
        </div>
        
        <Tabs 
          aria-label="Content Source" 
          color="primary" 
          variant="solid"
          selectedKey={selectedSource}
          onSelectionChange={(key) => setSelectedSource(key as string)}
        >
          <Tab key="asiadrama" title="Series & Movies" />
          <Tab key="phumikhmer" title="PhumiKhmer" />
        </Tabs>
      </div>
      
      <div className="flex flex-col gap-3 md:gap-8">
        {selectedSource === "asiadrama" && (
          CATEGORIES.map(category => (
            <KhmerCategorySection key={category.id} category={category} source="asiadrama" />
          ))
        )}
        {selectedSource === "phumikhmer" && (
          <PhumiKhmerGrid />
        )}
      </div>
    </main>
  );
};

export default KhmerDubbedPage;
