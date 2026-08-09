import { cn } from "@/utils/helpers";
import { ArrowLeft, List, Next, Prev } from "@/utils/icons";
import ActionButton from "@/components/sections/TV/Player/ActionButton";

interface KhmerPlayerHeaderProps {
  hidden?: boolean;
  onOpenEpisode?: () => void;
  hasEpisodes?: boolean;
  prevEpisodeUrl?: string;
  nextEpisodeUrl?: string;
}

const KhmerPlayerHeader: React.FC<KhmerPlayerHeaderProps> = ({
  hidden,
  onOpenEpisode,
  hasEpisodes,
  prevEpisodeUrl,
  nextEpisodeUrl,
}) => {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className={cn(
        "absolute top-0 z-40 flex h-28 w-full items-start justify-between gap-4",
        "bg-linear-to-b from-black/80 to-transparent p-2 text-white transition-opacity md:p-4 pointer-events-none",
        { "opacity-0": hidden },
      )}
    >
      <div className="pointer-events-auto">
        <ActionButton label="Back" href="/khmer">
          <ArrowLeft size={42} />
        </ActionButton>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        {hasEpisodes && (
          <>
            <ActionButton
              disabled={!prevEpisodeUrl}
              label="Previous Episode"
              tooltip="Previous Episode"
              href={prevEpisodeUrl || ""}
            >
              <Prev size={42} />
            </ActionButton>
            <ActionButton
              disabled={!nextEpisodeUrl}
              label="Next Episode"
              tooltip="Next Episode"
              href={nextEpisodeUrl || ""}
            >
              <Next size={42} />
            </ActionButton>
          </>
        )}
        {hasEpisodes && onOpenEpisode && (
          <ActionButton label="Episodes" tooltip="Episodes" onClick={onOpenEpisode}>
            <List size={34} />
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default KhmerPlayerHeader;
