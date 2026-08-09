"use client";

import { useState } from "react";
import { getMoviePlayers, getTvShowPlayers } from "@/utils/players";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [tmdbId, setTmdbId] = useState("550");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [selectedServer, setSelectedServer] = useState(0);

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
    { title: "Fight Club (Movie)", type: "movie", id: "550" },
    { title: "Avengers: Endgame (Movie)", type: "movie", id: "299536" },
    { title: "Game of Thrones S1E1", type: "tv", id: "1399", s: "1", e: "1" },
    { title: "Breaking Bad S1E1", type: "tv", id: "1396", s: "1", e: "1" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header / Input Form */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          TMDB Video Player Extractor
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Media Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Media Type
            </label>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setMediaType("movie");
                  setSelectedServer(0);
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
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mediaType === "tv"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                TV Show
              </button>
            </div>
          </div>

          {/* TMDB ID */}
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

          {/* TV Season & Episode */}
          {mediaType === "tv" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Season
                </label>
                <input
                  type="number"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  min="1"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Episode
                </label>
                <input
                  type="number"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  min="1"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>
          )}

          {/* Server Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Player Server
            </label>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {players.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.title} {p.recommended ? "★" : ""}
                </option>
              ))}
            </select>
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
                setMediaType(preset.type as "movie" | "tv");
                setTmdbId(preset.id);
                if (preset.s) setSeason(preset.s);
                if (preset.e) setEpisode(preset.e);
                setSelectedServer(0);
              }}
              className="px-3 py-1 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Box */}
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
            Enter a valid TMDB ID above to load video player.
          </div>
        )}
      </div>

      {/* Active Source Details */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div>
          <span className="font-semibold text-white">Active Server:</span> {activePlayer?.title}
        </div>
        <div className="truncate max-w-xl">
          <span className="font-semibold text-white">Source URL:</span>{" "}
          <a
            href={activePlayer?.source}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 underline hover:text-blue-300 transition"
          >
            {activePlayer?.source}
          </a>
        </div>
      </div>
    </div>
  );
}
