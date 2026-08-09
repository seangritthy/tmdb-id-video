"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { cn } from "@/utils/helpers";
import { Breadcrumbs, BreadcrumbItem, Card, Button, Spinner, ScrollShadow } from "@heroui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { IconDeviceTvOld, IconPlayerPlay, IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

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

  const [seen, setSeen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [episodes, setEpisodes] = useState<ExtractedEpisode[]>([]);
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    try {
      setSeen(Boolean(localStorage.getItem(ADS_WARNING_STORAGE_KEY)));
    } catch (e) {
      setSeen(false);
    }

    if (asiadramaSlug) {
      setLoading(true);
      setError("");
      setVideoUrl("");
      
      const type = searchParams.get("type");
      let extractUrl = `/api/asiadrama/extract?slug=${asiadramaSlug}&eps=${encodeURIComponent(asiadramaEps)}`;
      
      if (type === "168KH") {
        extractUrl = `/api/168kh/extract?slug=${asiadramaSlug}`;
      } else if (type === "PHUMIKHMER") {
        extractUrl = `/api/phumikhmer/movie?id=${asiadramaSlug}&eps=${encodeURIComponent(asiadramaEps)}`;
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
    // The browser would send Referer: vdomov.com which gets blocked.
    // Route through stream-proxy to spoof the Referer server-side.
    // The proxy uses ReadableStream (not buffering), so large files are fine.
    const isNizu = finalUrl.includes('nizu.top');
    const needsProxy = isNizu || useProxy || finalUrl.includes('admin168kh.com');
    const refererParam = isNizu ? `&referer=${encodeURIComponent('https://www.phumikhmer.net/')}` : '';
    const targetUrl = needsProxy
      ? `/api/stream-proxy?url=${encodeURIComponent(finalUrl)}${refererParam}`
      : finalUrl;

    if (isM3U8) {
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
        hls.on(Hls.Events.ERROR, (_evt, data) => {
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

  const onConfirm = () => {
    try {
      localStorage.setItem(ADS_WARNING_STORAGE_KEY, "true");
    } catch (e) {}
    setSeen(true);
  };

  let finalUrl = videoUrl;
  let explicitlyIframe = false;

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

  const isIframe =
    explicitlyIframe ||
    (finalUrl &&
      !finalUrl.toLowerCase().includes(".m3u8") &&
      !finalUrl.includes(".mp4") &&
      !finalUrl.includes("nizu.top"));

  return (
    <div className="w-full">
      {/* 
        Use negative horizontal and top margin to break out of container padding, 
        but avoid negative bottom margin so we don't overlap the title below. 
      */}
      <div className="relative w-full -mx-3 sm:-mx-5 -mt-8" style={{ height: "100svh" }}>
        <Card
          shadow="none"
          radius="none"
          className="relative bg-black border-none rounded-none"
          style={{ height: "100svh", overflow: "hidden", backgroundColor: "#000" }}
        >
          {/* Back Button Overlay */}
          <Link
            href="/khmer"
            prefetch={false}
            className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <IconArrowLeft size={24} />
          </Link>

          {/* Ads Warning Overlay */}
          {!seen && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 px-4">
              <IconDeviceTvOld size={64} className="text-danger mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Ads Warning!</h2>
              <p className="text-default-400 mb-6 max-w-md text-center text-sm">
                This player may contain pop-up ads from third-party servers. We strongly recommend
                using an ad blocker (like uBlock Origin).
              </p>
              <Button
                color="danger"
                variant="shadow"
                onPress={onConfirm}
                startContent={<IconPlayerPlay size={20} />}
              >
                I understand, play video
              </Button>
            </div>
          )}

          {/* Loading Overlay */}
          {seen && loading && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40 gap-4">
              <Spinner size="lg" color="primary" />
              <p className="text-white font-medium animate-pulse">Extracting stream...</p>
            </div>
          )}

          {/* Error Overlay */}
          {seen && !loading && error && (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40 gap-3">
              <IconAlertTriangle size={48} className="text-warning" />
              <p className="text-danger font-bold text-lg text-center px-4">{error}</p>
            </div>
          )}

          {/* Video Player (VdoTV style) */}
          {seen && !loading && videoUrl && (
            <div className="absolute inset-0 z-10 pt-[64px] bg-black">
              {isIframe ? (
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
                    muted
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPlaying={() => setIsPlaying(true)}
                    onWaiting={() => setIsPlaying(false)}
                    onLoadStart={() => setIsPlaying(false)}
                  />
                  {/* Channel info overlay on hover */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-white">{title}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className={cn("mt-4 mb-10 w-full mx-auto pb-10", SpacingClasses.reset)}>
        <Breadcrumbs variant="bordered" className="mb-4 hidden md:block">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/khmer">Khmer</BreadcrumbItem>
          <BreadcrumbItem href="#">{title}</BreadcrumbItem>
        </Breadcrumbs>

        <h1 className="text-2xl font-bold mb-6">{title}</h1>

        {/* Episode Selector (VdoTV Style) */}
        {episodes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5 mb-4">
              📺 Episodes <span>({episodes.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {episodes.map((ep, i) => {
                const epsParam = ep.url.split("eps=")[1] || "";
                const asiadramaType = searchParams.get("type") || "MOVIE";
                const url = `/khmer/player/${media.id}?slug=${asiadramaSlug}&type=${asiadramaType}&eps=${epsParam}`;
                return (
                  <Link href={url} key={i} prefetch={false} className="w-full block">
                    <Card
                      isPressable
                      className={cn(
                        "p-4 bg-secondary-background border transition-all hover:scale-[1.03] rounded-large overflow-hidden flex flex-col justify-center items-center gap-2 w-full",
                        ep.active
                          ? "border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full justify-center">
                        <span
                          className={cn(
                            "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            ep.active ? "bg-red-500 animate-pulse" : "bg-default-300"
                          )}
                        />
                        <h4
                          className={cn(
                            "font-bold text-sm truncate max-w-[85%]",
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
          </div>
        )}
      </div>
    </div>
  );
}
