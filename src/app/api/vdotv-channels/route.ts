import { NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const PDTVHD_PAGES = [
  "https://www.pdtvhd.com/",
  "https://www.pdtvhd.com/sports",
  "https://www.pdtvhd.com/news",
  "https://www.pdtvhd.com/entertainment",
  "https://www.pdtvhd.com/movies",
  "https://www.pdtvhd.com/kids",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://www.pdtvhd.com/",
};

const STREAM_REGEX =
  /https?:\/\/[^\s"'<>]+?\.(?:m3u8|ts|m3u)(?:\?[^\s"'<>]*)?/gi;

// Extract channel name from URL: cdn.pdtvhd.com/Sports/streams/PDTVHDSports.m3u8 → "PDTVHDSports"
function guessNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const filename = parts[parts.length - 1]?.replace(/\.m3u8?|\.ts/gi, "") ?? "Channel";
    // CamelCase → words
    return filename.replace(/([A-Z])/g, " $1").replace(/PDTVHD/gi, "").trim() || filename;
  } catch {
    return "Channel";
  }
}

// Guess group from URL path
function guessGroupFromUrl(url: string): string {
  const lower = url.toLowerCase();
  
  // Countries / Regions
  if (lower.includes("khmer") || lower.includes("cambodia") || lower.includes("ctv") || lower.includes("bayon") || lower.includes("tvk")) return "Cambodian TV";
  if (lower.includes("thai") || lower.includes("bangkok")) return "Thai TV";
  if (lower.includes("korea") || lower.includes("kbs") || lower.includes("sbs") || lower.includes("mbc") || lower.includes("ebs")) return "Korean TV";
  if (lower.includes("japan") || lower.includes("nhk")) return "Japanese TV";
  if (lower.includes("china") || lower.includes("cctv")) return "Chinese TV";
  if (lower.includes("vietnam") || lower.includes("vtv")) return "Vietnamese TV";
  if (lower.includes("usa") || lower.includes("uk") || lower.includes("english")) return "Western TV";
  
  // Genres
  if (lower.includes("sport") || lower.includes("espn") || lower.includes("tsn") || lower.includes("fifa")) return "Live Sports";
  if (lower.includes("news") || lower.includes("bbc") || lower.includes("cnn") || lower.includes("aljazeera")) return "News";
  if (lower.includes("movie") || lower.includes("cinema") || lower.includes("hbo")) return "Movies";
  if (lower.includes("kid") || lower.includes("child") || lower.includes("cartoon") || lower.includes("disney") || lower.includes("nick")) return "Kids";
  if (lower.includes("docu") || lower.includes("history") || lower.includes("discovery") || lower.includes("animal") || lower.includes("geo")) return "Documentary";
  if (lower.includes("entertain") || lower.includes("music") || lower.includes("mtv")) return "Entertainment";
  
  return "General";
}

// Generate a robust unique key for matching streams (uses last TWO path segments if possible)
function generateStreamKey(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`.toLowerCase();
    }
    return parts[parts.length - 1]?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

async function scrapePageForStreams(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = [...new Set(html.match(STREAM_REGEX) ?? [])];
    return matches;
  } catch {
    return [];
  }
}

// Merge with static channels, updating URLs where known
import staticChannels from "@/data/vdotv_channels.json";

// In-memory cache: avoid re-scraping 6 live pages on every single request,
// which was making /vdotv feel slow (up to ~6s per request). Serve cached
// results for CACHE_TTL_MS and only re-scrape once that window expires.
let cachedChannels: any[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();
  if (cachedChannels && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(
      { channels: cachedChannels, scrapedAt: new Date(cachedAt).toISOString(), cached: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    // Scrape all pdtvhd pages in parallel
    const results = await Promise.allSettled(
      PDTVHD_PAGES.map((p) => scrapePageForStreams(p))
    );

    const allStreamUrls = new Set<string>();
    for (const r of results) {
      if (r.status === "fulfilled") {
        r.value.forEach((u) => allStreamUrls.add(u));
      }
    }

    // Build a map of unique scraped URLs by their robust key
    const scrapedMap = new Map<string, string>();
    for (const url of allStreamUrls) {
      const key = generateStreamKey(url);
      if (key) scrapedMap.set(key, url);
    }

    // Update static channel list with fresh scraped URLs where we can match
    const updatedChannels = (staticChannels as any[]).map((ch) => {
      const key = generateStreamKey(ch.url);
      const freshUrl = scrapedMap.get(key);
      if (freshUrl) {
        scrapedMap.delete(key); // mark as consumed
        return { ...ch, url: freshUrl, scrapedAt: new Date().toISOString() };
      }
      return ch;
    });

    // Append any completely new URLs that were scraped but not in static list
    let idCounter = updatedChannels.length + 1;
    for (const [, url] of scrapedMap) {
      updatedChannels.push({
        id: `scraped-${idCounter++}`,
        name: guessNameFromUrl(url),
        url,
        logo: "",
        group: guessGroupFromUrl(url),
        status: "Unknown",
        latency: null,
        lastChecked: null,
        scrapedAt: new Date().toISOString(),
      });
    }

    cachedChannels = updatedChannels;
    cachedAt = now;

    return NextResponse.json(
      { channels: updatedChannels, scrapedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("vdotv-channels scrape error:", err);
    // Fallback to static data on error
    return NextResponse.json(
      { channels: staticChannels, scrapedAt: null, error: err.message },
      { status: 200 }
    );
  }
}
