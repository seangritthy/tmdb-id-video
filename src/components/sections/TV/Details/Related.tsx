import SectionTitle from "@/components/ui/other/SectionTitle";
import { isEmpty } from "@/utils/helpers";
import { Tab, Tabs } from "@heroui/react";
import { AppendToResponse, TV, TvShowDetails } from "tmdb-ts/dist/types";
import TvShowRelatedList from "./RelatedList";
import { useDictionary } from "@/components/providers/DictionaryProvider";

interface TvShowRelatedSectionProps {
  tv: AppendToResponse<TvShowDetails, ("recommendations" | "similar")[], "tvShow">;
}

const TvShowRelatedSection: React.FC<TvShowRelatedSectionProps> = ({ tv }) => {
  // @ts-expect-error: wrong type.
  const recommendations = tv.recommendations.results as TV[];
  const similar = tv.similar.results as TV[];
  const dictionary = useDictionary();

  return (
    <section id="related" className="z-3">
      <SectionTitle color="warning" className="mb-2 sm:mb-0 sm:translate-y-10">
        {dictionary.youMayLike}
      </SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-warning h-1 rounded-full" }}
      >
        {!isEmpty(recommendations) && (
          <Tab key="recommendations" title={dictionary.recommendations}>
            <TvShowRelatedList tvs={recommendations} />
          </Tab>
        )}
        {!isEmpty(similar) && (
          <Tab key="similar" title={dictionary.similar}>
            <TvShowRelatedList tvs={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default TvShowRelatedSection;
