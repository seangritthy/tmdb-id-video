"use client";

import { useEffect, useState } from "react";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import { useDictionary } from "@/components/providers/DictionaryProvider";

interface AsiadramaMovie {
  id: string;
  title: string;
  posterUrl: string;
  url: string;
  slug: string;
  year: string;
  type: string;
}

const CategoryGrid = ({ categoryId }: { categoryId: string }) => {
  const dictionary = useDictionary();
  const { ref, inViewport } = useInViewport();
  
  const [movies, setMovies] = useState<AsiadramaMovie[]>([]);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchMovies = async (pageToFetch: number) => {
    try {
      if (pageToFetch === 1) setIsPending(true);
      else setIsFetchingNextPage(true);

      const res = await fetch(`/api/asiadrama?category=${categoryId}&page=${pageToFetch}`);
      const data = await res.json();
      
      if (data.movies && data.movies.length > 0) {
        setMovies(prev => {
          const combined = pageToFetch === 1 ? data.movies : [...prev, ...data.movies];
          // Deduplicate
          const unique: AsiadramaMovie[] = [];
          const seenSlugs = new Set();
          for (const m of combined) {
            if (!seenSlugs.has(m.slug)) {
              seenSlugs.add(m.slug);
              unique.push(m);
            }
          }
          return unique;
        });
        setHasNextPage(data.movies.length >= 10); // Simple heuristic
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to fetch page", pageToFetch, error);
    } finally {
      setIsPending(false);
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    fetchMovies(1);
  }, [categoryId]);

  useEffect(() => {
    if (inViewport && !isPending && !isFetchingNextPage && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  }, [inViewport, isPending, isFetchingNextPage, hasNextPage]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          <Loop count={20} prefix="SkeletonCategoryCard">
            <PosterCardSkeleton variant="bordered" />
          </Loop>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid w-full">
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
              variant="bordered"
              href={`/khmer/player/${movie.id}?slug=${movie.slug}&type=${movie.type}`}
              disableHover
            />
          );
        })}
      </div>
      <div ref={ref} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && <Spinner size="lg" variant="wave" />}
        {!hasNextPage && !isPending && (
          <p className="text-muted-foreground text-center text-base">
            {dictionary.endOfList}
          </p>
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default CategoryGrid;
