"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether an ad blocker is active by injecting a decoy "bait" element
 * that ad blockers typically hide/remove (class names like "ad-banner", "adsbox", etc.)
 * and checking whether it ends up with zero height/width.
 *
 * Also tries fetching a known ad-related URL as a second check.
 */
const useAdBlocker = (): boolean | null => {
  // null = not checked yet, true = ad blocker detected, false = no ad blocker
  const [adBlockerActive, setAdBlockerActive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      // Method 1: bait element
      const bait = document.createElement("div");
      bait.setAttribute(
        "class",
        "ad-banner ads adsbox doubleclick ad-placement pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links",
      );
      bait.style.cssText =
        "position:absolute;top:-999px;left:-999px;width:1px;height:1px;";
      document.body.appendChild(bait);

      // Wait a tick for ad blockers to react
      await new Promise((r) => setTimeout(r, 150));

      const baitBlocked =
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        bait.style.display === "none" ||
        bait.style.visibility === "hidden" ||
        bait.style.opacity === "0" ||
        window.getComputedStyle(bait).display === "none";

      document.body.removeChild(bait);

      if (cancelled) return;

      if (baitBlocked) {
        setAdBlockerActive(true);
        return;
      }

      // Method 2: fetch a known ad script URL
      try {
        const res = await fetch(
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
          { method: "HEAD", mode: "no-cors", cache: "no-store" },
        );
        // If it reaches here without throwing, no ad blocker on fetch level
        if (!cancelled) setAdBlockerActive(false);
      } catch {
        if (!cancelled) setAdBlockerActive(true);
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  return adBlockerActive;
};

export default useAdBlocker;
