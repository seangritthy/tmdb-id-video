"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { Movie, TV } from "@/utils/icons";
import { Tabs, Tab, TabsProps } from "@heroui/react";
import { useDictionary } from "@/components/providers/DictionaryProvider";

interface ContentTypeSelectionProps extends TabsProps {
  onTypeChange?: (type: ContentType) => void;
}

const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({ onTypeChange, ...props }) => {
  const { content, setContent, resetFilters } = useDiscoverFilters();
  const dictionary = useDictionary();

  const handleTabChange = (key: ContentType) => {
    resetFilters();
    setContent(key);
    onTypeChange?.(key);
  };

  return (
    <Tabs
      size="lg"
      variant="underlined"
      selectedKey={content}
      aria-label="Content Type Selection"
      color={content === "movie" ? "primary" : "warning"}
      onSelectionChange={(value) => handleTabChange(value as ContentType)}
      classNames={{
        tabContent: "pb-2",
        cursor: "h-1 rounded-full",
      }}
      {...props}
    >
      <Tab
        key="movie"
        title={
          <div className="flex items-center space-x-2">
            <Movie />
            <span>{dictionary.movies}</span>
          </div>
        }
      />
      <Tab
        key="tv"
        title={
          <div className="flex items-center space-x-2">
            <TV />
            <span>{dictionary.tvShows}</span>
          </div>
        }
      />
    </Tabs>
  );
};

export default ContentTypeSelection;
