"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Card, Input, Button, Spinner } from "@heroui/react";
import { useDocumentTitle } from "@mantine/hooks";
import { useDictionary, TranslationKey } from "@/components/providers/DictionaryProvider";
import { BiSearchAlt2, BiTv } from "react-icons/bi";

interface Channel {
  id: string;
  name: string;
  url: string;
  group: string;
  status?: string | null;
  lastChecked?: string | null;
  latency?: number | null;
  logo?: string | null;
}

export default function VDOtvPage() {
  const dictionary = useDictionary();
  useDocumentTitle(`VDOtv | ${dictionary.vdotvTitle || "Live Stream Player"}`);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [useProxy, setUseProxy] = useState(false); // Default proxy to false for direct speed
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHlsSupported, setIsHlsSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerSectionRef = useRef<HTMLDivElement | null>(null);

  // Extract unique group names
  const groups = Array.from(new Set(channels.map((c) => c.group)));

  // Filter channels
  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === "all" || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Handle stream play preview
  const playChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setIsPlaying(false); // Reset loading spinner for new stream
    setUseProxy(false); // Try direct streaming first for new channel

    // Scroll to player smoothly
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Live-fetch channel list with fresh URLs from pdtvhd.com on every page load
  useEffect(() => {
    let cancelled = false;
    setChannelsLoading(true);
    setChannelsError(null);
    fetch("/api/vdotv-channels")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setChannels(data.channels ?? []);
          setChannelsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setChannelsError("Could not refresh channels. Showing cached list.");
          setChannelsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Protect page from inspect element (Anti-devTools / Anti-debugging)
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U (View Source)
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Anti-debugging loop (traps inspectors in a breakpoint loop)
    const interval = setInterval(() => {
      (function() {
        try {
          (function a(i) {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
              (function() {}).constructor("debugger")();
            } else {
              debugger;
            }
            a(++i);
          })(0);
        } catch (e) {}
      })();
    }, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!activeChannel || !videoRef.current) return;

    // Reset previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const targetUrl = useProxy
      ? `/api/stream-proxy?url=${encodeURIComponent(activeChannel.url)}`
      : activeChannel.url;

    const isM3U8 = activeChannel.url.toLowerCase().includes(".m3u8");

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
          video.play().catch((err) => console.log("Auto-play blocked:", err));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              if (!useProxy) {
                console.log("Direct load failed. Automatically retrying via CORS proxy...");
                setUseProxy(true);
              } else {
                console.log("Fatal network error with proxy, retrying load...");
                hls.startLoad();
              }
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              console.log("Fatal media error, trying to recover HLS...");
              hls.recoverMediaError();
            } else {
              console.error("Fatal HLS playback error:", data);
              setIsPlaying(false);
            }
          }
        });
        setIsHlsSupported(true);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Fallback for Safari native HLS playback
        video.src = targetUrl;
        video.play().catch((err) => console.log("Native HLS Auto-play blocked:", err));
        setIsHlsSupported(true);
      } else {
        setIsHlsSupported(false);
      }
    } else {
      // Normal TS stream or MP4
      video.src = targetUrl;
      video.onerror = () => {
        if (!useProxy) {
          console.log("Direct TS load failed. Trying via CORS proxy...");
          setUseProxy(true);
        }
      };
      video.play().catch((err) => console.log("Direct source Auto-play blocked:", err));
      setIsHlsSupported(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, useProxy]);

  // Start with a default stream if channels exist
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      // Find a working test stream or first stream
      const testStream = channels.find((c) => c.url.includes("mux.dev")) || channels[0];
      setActiveChannel(testStream);
    }
  }, [channels, activeChannel]);

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Video Player Section */}
      <div ref={playerSectionRef} className="w-full">
        <Card className="w-full bg-black border border-white/10 shadow-2xl relative rounded-large overflow-hidden aspect-video flex flex-col justify-between group">
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              onPlay={() => setIsPlaying(true)}
              onPlaying={() => setIsPlaying(true)}
              onWaiting={() => setIsPlaying(false)}
              onLoadStart={() => setIsPlaying(false)}
            />
            {/* Hover Header Overlay */}
            {activeChannel && (
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-3">
                  {activeChannel.logo && (
                    <div className="w-10 h-10 rounded-none bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={activeChannel.logo} alt={activeChannel.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-sm font-semibold text-white tracking-wide">{activeChannel.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Filter and Cards Container */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
              📺 {dictionary.vdotvDirectory || "TV Channel Directory"}{" "}
              {channelsLoading ? (
                <span className="text-sm font-normal text-default-400">(loading…)</span>
              ) : (
                <span>({filteredChannels.length})</span>
              )}
            </h2>
            <Input
              isClearable
              className="max-w-[280px]"
              placeholder={dictionary.vdotvSearch || "Search channels..."}
              startContent={<BiSearchAlt2 className="text-default-400" />}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>

          {/* Pro IPTV Style Horizontal Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Button
              size="sm"
              variant={selectedGroup === "all" ? "solid" : "bordered"}
              color={selectedGroup === "all" ? "primary" : "default"}
              onPress={() => setSelectedGroup("all")}
              className={`rounded-full min-w-max ${selectedGroup !== 'all' ? 'border-white/10 hover:border-white/30' : ''}`}
            >
              {dictionary.vdotvAllGroups || "All Channels"}
            </Button>
            {groups.sort((a,b) => {
              // Always put Cambodian/Khmer first if exists
              if (a.includes("Cambodian")) return -1;
              if (b.includes("Cambodian")) return 1;
              return a.localeCompare(b);
            }).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={selectedGroup === g ? "solid" : "bordered"}
                color={selectedGroup === g ? "primary" : "default"}
                onPress={() => setSelectedGroup(g)}
                className={`rounded-full min-w-max ${selectedGroup !== g ? 'border-white/10 hover:border-white/30 text-default-600 hover:text-white' : ''}`}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {channelsLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-default-400 animate-pulse">🔄 Fetching latest stream URLs from pdtvhd.com…</p>
          </div>
        ) : channelsError ? (
          <div className="col-span-full text-center text-warning-400 text-sm py-4 bg-warning-950/30 rounded-lg border border-warning-500/20 px-4">
            ⚠️ {channelsError}
          </div>
        ) : null}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${channelsLoading ? "hidden" : ""}`}>
          {filteredChannels.map((channel) => {
            const isActive = activeChannel?.id === channel.id;
            return (
              <Card
                key={channel.id}
                isPressable
                onPress={() => playChannel(channel)}
                className={`p-4 bg-secondary-background border transition-all hover:scale-[1.03] rounded-large overflow-hidden flex flex-col justify-between gap-4 ${
                  isActive
                    ? "border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col gap-3 text-start w-full">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <BiTv className="text-xl text-default-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
                      <h4 className="font-bold text-sm text-foreground truncate max-w-[85%]" title={channel.name}>
                        {channel.name}
                      </h4>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    </div>
                  </div>
                </div>

              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
