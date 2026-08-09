import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton, Spinner } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState, useEffect } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  usePlayerEvents({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  useEffect(() => {
    setIsIframeLoading(true);
  }, [PLAYER.source]);

  return (
    <>
      <AdsWarning />

      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <Card shadow="md" radius="none" className="relative h-[100dvh]" style={{ overflow: "visible" }}>
          {!seen && <Skeleton className="absolute h-full w-full" />}
          {seen && (
            <>
              {isIframeLoading && (
                <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center gap-4 pointer-events-none">
                  <Spinner size="lg" color="primary" />
                  <p className="text-white font-medium animate-pulse text-sm sm:text-base">
                    Loading stream player...
                  </p>
                </div>
              )}
              <iframe
                allowFullScreen
                allow="autoplay; fullscreen *; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write;"
                key={PLAYER.source}
                src={PLAYER.source}
                onLoad={() => setIsIframeLoading(false)}
                className={cn("relative z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
                style={{ border: "none" }}
              />
            </>
          )}
        </Card>
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
