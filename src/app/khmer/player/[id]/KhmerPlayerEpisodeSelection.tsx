import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { HandlerType } from "@/types/component";
import { Card } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/helpers";

interface ExtractedEpisode {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

interface KhmerPlayerEpisodeSelectionProps extends HandlerType {
  episodes: ExtractedEpisode[];
  mediaId: string;
  asiadramaSlug: string;
  asiadramaType: string;
}

const KhmerPlayerEpisodeSelection: React.FC<KhmerPlayerEpisodeSelectionProps> = ({
  opened,
  onClose,
  episodes,
  mediaId,
  asiadramaSlug,
  asiadramaType,
}) => {
  return (
    <VaulDrawer
      open={opened}
      onClose={onClose}
      backdrop="blur"
      title="Select Episode"
      direction="right"
      hiddenHandler
      withCloseButton
    >
      <div className="grid grid-cols-1 gap-2 p-2 sm:gap-4 sm:p-4 h-full overflow-y-auto">
        {episodes.map((ep, i) => {
          const epsParam = ep.url.split("eps=")[1] || "";
          const url = `/khmer/player/${mediaId}?slug=${asiadramaSlug}&type=${asiadramaType}&eps=${epsParam}`;
          return (
            <Link href={url} key={i} prefetch={false} className="w-full block" onClick={onClose}>
              <Card
                isPressable
                className={cn(
                  "p-4 bg-secondary-background border transition-all hover:scale-[1.03] rounded-large overflow-hidden flex flex-col justify-center items-center gap-2 w-full",
                  ep.active
                    ? "border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-2 w-full justify-start px-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      ep.active ? "bg-red-500 animate-pulse" : "bg-default-300"
                    )}
                  />
                  <h4
                    className={cn(
                      "font-bold text-sm truncate",
                      ep.active ? "text-primary" : "text-foreground"
                    )}
                    title={ep.name}
                  >
                    {ep.name}
                  </h4>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </VaulDrawer>
  );
};

export default KhmerPlayerEpisodeSelection;
