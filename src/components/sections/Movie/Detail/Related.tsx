"use client";

import { AppendToResponse, Movie, MovieDetails } from "tmdb-ts/dist/types";
import { Tab, Tabs } from "@heroui/react";
import RelatedMovieList from "./RelatedList";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { useDictionary } from "@/components/providers/DictionaryProvider";

const RelatedSection: React.FC<{
  movie: AppendToResponse<MovieDetails, ("recommendations" | "similar")[], "movie">;
}> = ({ movie }) => {
  const recommendations = movie.recommendations.results as Movie[];
  const similar = movie.similar.results as Movie[];
  const dictionary = useDictionary();

  return (
    <section id="related" className="z-3">
      <SectionTitle className="mb-2 sm:mb-0 sm:translate-y-10">{dictionary.youMayLike}</SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-primary h-1 rounded-full" }}
      >
        {recommendations.length > 0 && (
          <Tab key="recommendations" title={dictionary.recommendations}>
            <RelatedMovieList movies={recommendations} />
          </Tab>
        )}
        {similar.length > 0 && (
          <Tab key="similar" title={dictionary.similar}>
            <RelatedMovieList movies={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default RelatedSection;
