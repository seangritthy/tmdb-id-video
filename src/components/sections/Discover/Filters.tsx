import GenresSelect from "@/components/ui/input/GenresSelect";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { Select, SelectItem, Button } from "@heroui/react";
import { useDictionary, TranslationKey } from "@/components/providers/DictionaryProvider";

const DiscoverFilters = () => {
  const { types, content, genres, queryType, setQueryType, setGenres, resetFilters } =
    useDiscoverFilters();
  const dictionary = useDictionary();

  const getTranslatedName = (key: string, name: string) => {
    if (key === "discover") return dictionary.discover;
    const titleKey = `${key}${content === "movie" ? "Movies" : "TvShows"}` as TranslationKey;
    return dictionary[titleKey] || name;
  };

  return (
    <div className="flex w-full flex-wrap justify-center gap-3">
      <ContentTypeSelection className="mb-5 justify-center" />
      <div className="flex w-full flex-wrap justify-center gap-3">
        <Select
          disallowEmptySelection
          selectionMode="single"
          size="sm"
          label={dictionary.type}
          placeholder={dictionary.selectType}
          className="max-w-xs"
          selectedKeys={[queryType]}
          onChange={({ target }) => {
            setQueryType(target.value as DiscoverMoviesFetchQueryType);
            setGenres(null);
          }}
          value={queryType}
        >
          {types.map(({ name, key }) => {
            return <SelectItem key={key}>{getTranslatedName(key, name) as string}</SelectItem>;
          })}
        </Select>
        <GenresSelect
          type={content}
          selectedKeys={genres}
          onGenreChange={(genres) => {
            setGenres(genres);
            setQueryType("discover");
          }}
        />
      </div>
      <Button size="sm" onPress={resetFilters}>
        {dictionary.resetFilters}
      </Button>
    </div>
  );
};

export default DiscoverFilters;
