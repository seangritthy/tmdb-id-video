"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import { notFound, useSearchParams } from "next/navigation";
import { use } from "react";
import KhmerPlayer from "./KhmerPlayer";

const KhmerMoviePlayerPage: NextPage<Params<{ id: string }>> = ({ params }) => {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const type = searchParams.get('type') || 'MOVIE';

  const isUnmapped = isNaN(Number(id));

  const {
    data: tmdbData,
    isPending,
    error,
  } = useQuery({
    queryFn: async (): Promise<any> => {
      if (isUnmapped) {
        // Return mock TMDB data for unmapped items
        return {
          id,
          title: slug?.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'Khmer Dubbed',
          name: slug?.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'Khmer Dubbed',
          overview: "No overview available.",
          poster_path: null,
          backdrop_path: null,
          vote_average: 0,
          release_date: "2024-01-01",
          first_air_date: "2024-01-01",
        };
      }
      return type === 'TV' ? tmdb.tvShows.details(id as any) : tmdb.movies.details(id as any);
    },
    queryKey: ["khmer-player-detail", id, type],
  });

  if (!slug) return notFound();

  if (isPending) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (!isUnmapped && (error || isEmpty(tmdbData))) return notFound();

  const title = tmdbData?.title || tmdbData?.name || "Khmer Dubbed";

  return <KhmerPlayer title={title} media={tmdbData} params={params} />;
};

export default KhmerMoviePlayerPage;
