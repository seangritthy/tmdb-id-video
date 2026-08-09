"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { getMoviePlayers, getTvShowPlayers } from "@/utils/players";

interface TmdbMediaResult {
  id: number | string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const TMDB_BEARER =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZTEwYmYwNmU0ZjE1ZGFlNmU5ZmYzNWZmMzVlOGRmMiIsIm5iZiI6MTc0MzYwNjI3My45NjIsInN1YiI6IjY3ZWQ1MjAxODM2YzhlZGE3Y2FhZjc4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.S3sKVtyFQ0kWZRrE4bVGGtw7VAHiEQ2cPUHmFlmmRrg";

export default function HomePage() {
  const [tmdbId, setTmdbId] = useState("550");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchResult, setSearchResult] = useState<TmdbMediaResult | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);

  const isTv = Boolean(season.trim() || episode.trim());

  // Fetch TMDB Metadata & Poster
  const fetchTmdbData = async (id: string, s?: string, e?: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const type = (s.trim() || e.trim()) ? "tv" : "movie";
      const endpoint = `https://api.themoviedb.org/3/${type}/${id.trim()}`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Invalid TMDB ID or resource not found (HTTP ${res.status})`);
      }

      const data = await res.json();
      setSearchResult({
        id: data.id,
        title: data.title || data.name || `TMDB ${id}`,
        overview: data.overview || "No description available.",
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        release_date: data.release_date || data.first_air_date,
        vote_average: data.vote_average,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load TMDB details.");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTmdbData("550");
  }, []);

  const handleSearch = (ev?: FormEvent) => {
    if (ev) ev.preventDefault();
    setIsPlaying(false);
    fetchTmdbData(tmdbId, season, episode);
  };

  const handlePosterClick = () => {
    setIsPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const players = isTv
    ? getTvShowPlayers(
        tmdbId || "1399",
        parseInt(season, 10) || 1,
        parseInt(episode, 10) || 1
      )
    : getMoviePlayers(tmdbId || "550");

  const activePlayer = players[selectedServer] || players[0];

  const posterUrl = searchResult?.poster_path
    ? `https://image.tmdb.org/t/p/w500${searchResult.poster_path}`
    : "/icons/icon-512x512.png";

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto font-sans">
      {/* Header & Inline Search Bar: TMDB ID | Season | Episode | [Search] */}
      <form
        onSubmit={handleSearch}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TMDB Video Player
          </h1>
          <span className="text-xs text-neutral-400">vsembed.ru</span>
        </div>

        {/* Top Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          {/* TMDB ID */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              TMDB ID
            </label>
            <input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="550"
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Season */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Season
            </label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="Optional (e.g. 1)"
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Episode */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Episode
            </label>
            <input
              type="text"
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              placeholder="Optional (e.g. 1)"
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Search Button */}
          <div className="flex flex-col justify-end">
            <label className="text-[11px] font-bold uppercase tracking-wider text-transparent mb-1 hidden sm:block">
              Submit
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Error Output */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* ↓ Search Output: TMDB Poster Card (Click Poster -> Play Video) */}
      {searchResult && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-xs font-semibold text-neutral-500 tracking-widest uppercase">
            ↓ Search Result
          </div>

          <div
            onClick={handlePosterClick}
            className="group cursor-pointer relative flex flex-col items-center bg-neutral-900 border border-neutral-800 hover:border-blue-500/80 rounded-2xl p-4 w-64 md:w-72 shadow-2xl transition-all transform hover:scale-105"
          >
            {/* Poster Image */}
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-neutral-800">
              <img
                src={posterUrl}
                alt={searchResult.title}
                className="w-full h-full object-cover"
              />
              {/* Click to Play Overlay */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600/90 px-3 py-1 rounded-full">
                  Click to Play
                </span>
              </div>
            </div>

            {/* Movie Name */}
            <div className="mt-3 text-center w-full">
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition truncate">
                {searchResult.title}
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                {isTv ? `TV Show (S${season || 1}E${episode || 1})` : "Movie"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ▶ Play Video Section */}
      {isPlaying && (
        <div ref={playerRef} className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white">
                ▶ Playing: {searchResult?.title || `TMDB ${tmdbId}`}
              </span>
            </div>

            {/* Player Server Choice */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400 font-semibold">Server:</label>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(Number(e.target.value))}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                {players.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.title} {p.recommended ? "★" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
            {activePlayer?.source && (
              <iframe
                key={activePlayer.source}
                src={activePlayer.source}
                className="w-full h-full border-none"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
