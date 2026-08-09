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
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [tmdbId, setTmdbId] = useState("550");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchResult, setSearchResult] = useState<TmdbMediaResult | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);

  // Fetch TMDB Metadata & Poster
  const fetchTmdbData = async (id: string, type: "movie" | "tv") => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const endpoint = `https://api.themoviedb.org/3/${type}/${id.trim()}`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${type} details (HTTP ${res.status})`);
      }

      const data = await res.json();
      setSearchResult({
        id: data.id,
        title: data.title || data.name || "Untitled",
        overview: data.overview || "No overview available.",
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        release_date: data.release_date || data.first_air_date,
        vote_average: data.vote_average,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid TMDB ID or network error.");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTmdbData("550", "movie");
  }, []);

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsPlaying(false);
    fetchTmdbData(tmdbId, mediaType);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const players =
    mediaType === "movie"
      ? getMoviePlayers(tmdbId || "550")
      : getTvShowPlayers(
          tmdbId || "1399",
          parseInt(season, 10) || 1,
          parseInt(episode, 10) || 1
        );

  const activePlayer = players[selectedServer] || players[0];

  const presets = [
    { title: "Fight Club", type: "movie", id: "550" },
    { title: "Avengers: Endgame", type: "movie", id: "299536" },
    { title: "Game of Thrones S1E1", type: "tv", id: "1399", s: "1", e: "1" },
    { title: "Breaking Bad S1E1", type: "tv", id: "1396", s: "1", e: "1" },
  ];

  const posterUrl = searchResult?.poster_path
    ? `https://image.tmdb.org/t/p/w500${searchResult.poster_path}`
    : "/icons/icon-512x512.png";

  const backdropUrl = searchResult?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${searchResult.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header & Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TMDB Video Player
          </h1>
          <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
            vsembed.ru Enabled
          </span>
        </div>

        {/* Input Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* Media Type Column */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Type
            </label>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setMediaType("movie");
                  setSelectedServer(0);
                  setIsPlaying(false);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mediaType === "movie"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Movie
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType("tv");
                  setSelectedServer(0);
                  setIsPlaying(false);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mediaType === "tv"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                TV
              </button>
            </div>
          </div>

          {/* TMDB ID Column */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              TMDB ID
            </label>
            <input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="e.g. 550"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Season Column */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Season
            </label>
            <input
              type="number"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              disabled={mediaType !== "tv"}
              min="1"
              className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition ${
                mediaType !== "tv" ? "opacity-40 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Episode Column */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Episode
            </label>
            <input
              type="number"
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              disabled={mediaType !== "tv"}
              min="1"
              className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition ${
                mediaType !== "tv" ? "opacity-40 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Search Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Poster</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium mr-2">Quick Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const type = preset.type as "movie" | "tv";
                setMediaType(type);
                setTmdbId(preset.id);
                if (preset.s) setSeason(preset.s);
                if (preset.e) setEpisode(preset.e);
                setSelectedServer(0);
                setIsPlaying(false);
                fetchTmdbData(preset.id, type);
              }}
              className="px-3 py-1 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Search Result & Poster Display */}
      {searchResult && (
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
          {backdropUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-sm"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
          )}

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            {/* Clickable Poster */}
            <div
              onClick={handlePlay}
              className="relative group cursor-pointer flex-shrink-0 w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-neutral-700/80 transition-transform transform hover:scale-[1.03]"
            >
              <img
                src={posterUrl}
                alt={searchResult.title}
                className="w-full h-full object-cover"
              />
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-blue-600/90 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-blue-600/80 px-3 py-1 rounded-full backdrop-blur">
                  Click to Play
                </span>
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase">
                  {mediaType}
                </span>
                {searchResult.release_date && (
                  <span className="text-xs text-neutral-400 font-medium">
                    {searchResult.release_date.substring(0, 4)}
                  </span>
                )}
                {searchResult.vote_average !== undefined && (
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">
                    ★ {searchResult.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                {searchResult.title}
              </h2>

              <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4 max-w-3xl">
                {searchResult.overview}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play Video Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Video Player */}
      {isPlaying && (
        <div ref={playerRef} className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-white">
                Playing: {searchResult?.title || `TMDB ${tmdbId}`}
              </span>
            </div>

            {/* Server Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-neutral-400">Server:</label>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(Number(e.target.value))}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
            {activePlayer?.source ? (
              <iframe
                key={activePlayer.source}
                src={activePlayer.source}
                className="w-full h-full border-none"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                No active player source available.
              </div>
            )}
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
            <div>
              <span className="font-semibold text-white">Active Server:</span> {activePlayer?.title}
            </div>
            <div className="truncate max-w-xl">
              <span className="font-semibold text-white">Source URL:</span>{" "}
              <a
                href={activePlayer?.source}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                {activePlayer?.source}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
