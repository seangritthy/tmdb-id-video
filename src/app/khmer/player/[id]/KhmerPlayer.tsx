"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { cn } from "@/utils/helpers";
import { Breadcrumbs, BreadcrumbItem, Card, Button, Spinner, ScrollShadow, Skeleton } from "@heroui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// Dynamic import only — hls.js uses XMLHttpRequest which doesn't exist on Cloudflare Edge SSR
import { IconDeviceTvOld, IconPlayerPlay, IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import KhmerPlayerHeader from "./KhmerPlayerHeader";
import KhmerPlayerEpisodeSelection from "./KhmerPlayerEpisodeSelection";
import { useIdle, useDisclosure } from "@mantine/hooks";
import useBreakpoints from "@/hooks/useBreakpoints";
import dynamic from "next/dynamic";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));

interface ExtractedEpisode {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export default function KhmerPlayer({
  title,
  media,
  params,
}: {
  title: string;
  media: any;
  params: any;
}) {
  const searchParams = useSearchParams();
  const asiadramaSlug = searchParams.get("slug");
  const asiadramaEps = searchParams.get("eps") || "";
  const sourceType = searchParams.get("type") || "AUTO";
  const TYPE_MAPPING: Record<string, string> = {
    "asiadrama": "ASIAN_DRAMA",
    "phumikhmer": "PHUMIKHMER"
  };
  const sourceLabels: Record<string, string> = {
    PHUMIKHMER: "PhumiKhmer",
    AUTO: "AsiaDrama",
  };
  const sourceLabel = sourceLabels[sourceType] || sourceType;

  const [seen, setSeen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [episodes, setEpisodes] = useState<ExtractedEpisode[]>([]);
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    setSeen(true);

    if (asiadramaSlug) {
      setLoading(true);
      setError("");
      setVideoUrl("");
      
      const type = searchParams.get("type");
      let extractUrl = `/api/asiadrama/extract?slug=${asiadramaSlug}&eps=${encodeURIComponent(asiadramaEps)}`;
      
      if (type === "PHUMIKHMER") {
        // Add a timestamp cache buster so Cloudflare always fetches the latest API response
        extractUrl = `/api/phumikhmer/movie?id=${asiadramaSlug}&eps=${encodeURIComponent(asiadramaEps)}&t=${Date.now()}`;
      }

      fetch(extractUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setVideoUrl(data.videoUrl || data.streamUrl);
            setEpisodes(data.episodes || []);
            
            // Prefetch next episode in background for instant loading
            if (data.episodes && Array.isArray(data.episodes)) {
              const activeIndex = data.episodes.findIndex((e: any) => e.active);
              if (activeIndex !== -1 && activeIndex + 1 < data.episodes.length) {
                const nextEpsUrl = data.episodes[activeIndex + 1].url;
                const nextEpsMatch = nextEpsUrl.match(/eps=([^&]+)/);
                if (nextEpsMatch) {
                  const nextEps = nextEpsMatch[1];
                  fetch(`/api/asiadrama/extract?slug=${asiadramaSlug}&eps=${encodeURIComponent(nextEps)}`)
                    .catch(() => {}); // Ignore errors, it's just a prefetch
                }
              }
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Extract error:", err);
          setError("Failed to load video stream");
          setLoading(false);
        });
    } else {
      setError("Missing slug");
      setLoading(false);
    }
  }, [asiadramaSlug, asiadramaEps]);

  // VdoTV-style HLS player logic
  useEffect(() => {
    if (!videoUrl || !videoRef.current || !seen) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    let finalUrl = videoUrl;
    let explicitlyIframe = false;
    
    if (
      videoUrl.includes("jwplayer") ||
      videoUrl.includes("vk.com") ||
      videoUrl.includes("ok.ru") ||
      videoUrl.includes("youtube.com") ||
      videoUrl.includes("video4khmer") ||
      videoUrl.includes("khmerdrama.org")
    ) {
      explicitlyIframe = true;
    }
    
    // Extract actual source from embeds if it's not jwplayer
    if (videoUrl.includes("?source=") && !videoUrl.includes("jwplayer")) {
      try {
        const urlParams = new URL(videoUrl).searchParams;
        const sourceParam = urlParams.get("source");
        if (sourceParam) {
          finalUrl = decodeURIComponent(sourceParam);
        }
      } catch (e) {
        // Ignore parsing errors and fallback
      }
    }

    const isM3U8 = finalUrl.toLowerCase().includes(".m3u8");
    // nizu.top uses ?type=.mp4 param but is a real direct MP4 file
    const isNizuTop = finalUrl.includes("nizu.top");
    const isDirectMp4 = finalUrl.includes(".mp4") || isNizuTop;
    const isIframe = explicitlyIframe || (!isM3U8 && !isDirectMp4);

    if (isIframe) {
      // handled in JSX — iframe embed
      return;
    }

    // Upgrade HTTP to HTTPS whenever possible to avoid Mixed Content errors natively
    if (finalUrl.startsWith("http://")) {
      finalUrl = finalUrl.replace(/^http:\/\//i, "https://");
    }

    // nizu.top requires Referer: phumikhmer.net or it returns 403.
    const isNizu = finalUrl.includes('nizu.top');
    const needsProxy = isNizu || useProxy;
    const refererParam = isNizu ? `&referer=${encodeURIComponent('https://www.phumikhmer.net/')}` : '';
    const targetUrl = needsProxy
      ? `/api/stream-proxy?url=${encodeURIComponent(finalUrl)}${refererParam}`
      : finalUrl;

    if (isM3U8) {
      // Dynamic import to avoid XMLHttpRequest crash on Cloudflare Edge SSR
      import("hls.js").then(({ default: Hls }) => {
        if (!videoRef.current) return;
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxMaxBufferLength: 10,
            enableWorker: true,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 4,
            maxBufferLength: 5,
          });
          hlsRef.current = hls;
          hls.loadSource(targetUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch((err) => console.log("Autoplay blocked:", err));
          });
          hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                if (!useProxy) {
                  console.log("Direct failed, retrying via proxy...");
                  setUseProxy(true);
                } else {
                  hls.startLoad();
                }
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setIsPlaying(false);
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS
          video.src = targetUrl;
          video.play().catch(() => {});
        }
      });
    } else {
      // Direct MP4
      video.src = targetUrl;
      video.onerror = () => {
        if (!useProxy) {
          setUseProxy(true);
        }
      };
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, useProxy, seen]);

  const [isVideoMuted, setIsVideoMuted] = useState(true);

  useEffect(() => {
    try {
      const savedMuted = localStorage.getItem('vdomov_muted');
      if (savedMuted === 'false') {
        setIsVideoMuted(false);
      }
    } catch(e) {}
  }, []);

  const onConfirm = () => {
    try {
      localStorage.setItem(ADS_WARNING_STORAGE_KEY, "true");
    } catch (e) {}
    setSeen(true);
  };

  let finalUrl = videoUrl || "";
  let explicitlyIframe = false;

  if (videoUrl && typeof videoUrl === "string") {
    if (videoUrl.includes("?source=") && !videoUrl.includes("jwplayer")) {
      try {
        // Provide a dummy base URL to prevent crashes on relative URLs
        const sourceParam = new URL(videoUrl, "http://localhost").searchParams.get("source");
        if (sourceParam) finalUrl = decodeURIComponent(sourceParam);
      } catch (e) {}
    }

    if (
      videoUrl.includes("jwplayer") ||
      videoUrl.includes("vk.com") ||
      videoUrl.includes("ok.ru") ||
      videoUrl.includes("youtube.com") ||
      videoUrl.includes("video4khmer") ||
      videoUrl.includes("khmerdrama.org")
    ) {
      explicitlyIframe = true;
    }
  }

  const isIframe =
    explicitlyIframe ||
    (finalUrl &&
      typeof finalUrl === "string" &&
      !finalUrl.toLowerCase().includes(".m3u8") &&
      !finalUrl.includes(".mp4") &&
      !finalUrl.includes("nizu.top"));

  const { mobile } = useBreakpoints();
  const idle = useIdle(3000);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);

  const activeIndex = episodes.findIndex((e) => e.active);
  let prevEpisodeUrl = "";
  let nextEpisodeUrl = "";

  if (activeIndex !== -1) {
    const currentEp = episodes[activeIndex];
    const currentNameMatch = currentEp.name.match(/\d+/);
    
    if (currentNameMatch) {
      const currentNum = parseInt(currentNameMatch[0], 10);
      const asiadramaType = searchParams.get("type") || "MOVIE";
      const mediaId = media?.id || "player";

      // Find exactly the next and previous episodes by their number
      const nextEp = episodes.find(e => {
        const m = e.name.match(/\d+/);
        return m && parseInt(m[0], 10) === currentNum + 1;
      });

      const prevEp = episodes.find(e => {
        const m = e.name.match(/\d+/);
        return m && parseInt(m[0], 10) === currentNum - 1;
      });

      if (nextEp) {
        const epsParam = nextEp.url.split("eps=")[1] || "";
        nextEpisodeUrl = `/khmer/player/${mediaId}?slug=${asiadramaSlug}&type=${asiadramaType}&eps=${epsParam}`;
      }

      if (prevEp) {
        const epsParam = prevEp.url.split("eps=")[1] || "";
        prevEpisodeUrl = `/khmer/player/${mediaId}?slug=${asiadramaSlug}&type=${asiadramaType}&eps=${epsParam}`;
      }
    }
  }

  return (
    <>
      <AdsWarning />
      
      <div className={cn("relative", SpacingClasses.reset)}>
        <KhmerPlayerHeader
          hidden={idle && !mobile}
          onOpenEpisode={episodeHandlers.open}
          hasEpisodes={episodes.length > 0}
          prevEpisodeUrl={prevEpisodeUrl}
          nextEpisodeUrl={nextEpisodeUrl}
        />

        <Card shadow="md" radius="none" className="relative h-[100dvh] bg-black" style={{ overflow: "visible" }}>
          {!seen && <Skeleton className="absolute h-full w-full" />}
          
          {seen && loading && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40 gap-4">
              <Spinner size="lg" color="primary" />
              <p className="text-white font-medium animate-pulse">Extracting stream...</p>
            </div>
          )}

          {seen && !loading && error && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40 gap-3">
              <IconAlertTriangle size={48} className="text-warning" />
              <p className="text-danger font-bold text-lg text-center px-4">{error}</p>
            </div>
          )}

          {seen && !loading && videoUrl && (
            <div className={cn("absolute inset-0 z-10 bg-black", { "pointer-events-none": idle && !mobile })}>
              {finalUrl.includes("video4khmer.khmerdrama.org") ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 px-4">
                  <IconAlertTriangle size={64} className="text-warning mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3 text-center">Video Cannot Be Embedded</h3>
                  <p className="text-white/70 mb-8 text-center max-w-lg text-lg">
                    This specific video is protected and cannot be played directly inside the app. Please open it in a new tab to watch on the original website.
                  </p>
                  <Button 
                    as="a" 
                    href={finalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="primary" 
                    size="lg"
                    className="font-bold px-8 py-6 text-lg shadow-lg shadow-primary/30"
                  >
                    Watch this from other website
                  </Button>
                </div>
              ) : isIframe ? (
                <iframe
                  src={finalUrl.replace(/^http:\/\//i, "https://")}
                  className="w-full h-full border-none bg-black"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative w-full h-full group">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                    muted={isVideoMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPlaying={() => setIsPlaying(true)}
                    onWaiting={() => setIsPlaying(false)}
                    onLoadStart={() => {
                      setIsPlaying(false);
                      // Restore volume and playback speed from localStorage
                      if (videoRef.current) {
                        try {
                          const savedVol = localStorage.getItem('vdomov_volume');
                          const savedMuted = localStorage.getItem('vdomov_muted');
                          const savedSpeed = localStorage.getItem('vdomov_speed');
                          if (savedVol !== null) videoRef.current.volume = parseFloat(savedVol);
                          if (savedMuted !== null) videoRef.current.muted = savedMuted === 'true';
                          if (savedSpeed !== null) videoRef.current.playbackRate = parseFloat(savedSpeed);
                        } catch(e) {}
                      }
                    }}
                    onVolumeChange={(e) => {
                      try {
                        const target = e.target as HTMLVideoElement;
                        localStorage.setItem('vdomov_volume', target.volume.toString());
                        localStorage.setItem('vdomov_muted', target.muted.toString());
                        setIsVideoMuted(target.muted);
                      } catch(err) {}
                    }}
                    onRateChange={(e) => {
                      try {
                        const target = e.target as HTMLVideoElement;
                        localStorage.setItem('vdomov_speed', target.playbackRate.toString());
                      } catch(err) {}
                    }}
                  />
                  
                  {/* Title overlay when not idle */}
                  <div className={cn("absolute top-28 left-0 right-0 z-10 flex items-center gap-3 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 pointer-events-none", { "opacity-0": idle && !mobile })}>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-white">{title}</span>
                  </div>

                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {episodes.length > 0 && (
        <KhmerPlayerEpisodeSelection
          opened={episodeOpened}
          onClose={episodeHandlers.close}
          episodes={episodes}
          mediaId={media?.id || "player"}
          asiadramaSlug={asiadramaSlug || ""}
          asiadramaType={searchParams.get("type") || "MOVIE"}
        />
      )}
    </>
  );
}
