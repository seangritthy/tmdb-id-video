"use client";

import useAdBlocker from "@/hooks/useAdBlocker";
import { Button, Link } from "@heroui/react";
import { useEffect, useState } from "react";

const AD_BLOCKER_DISMISSED_KEY = "adblocker-banner-dismissed";

const AdBlockerPrompt: React.FC = () => {
  const adBlockerActive = useAdBlocker();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    try {
      const val = localStorage.getItem(AD_BLOCKER_DISMISSED_KEY);
      setDismissed(val === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(AD_BLOCKER_DISMISSED_KEY, "true");
    } catch {}
    setDismissed(true);
  };

  // Still checking, ad blocker found, or already dismissed
  if (adBlockerActive === null || adBlockerActive === true || dismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col gap-3 border-t border-warning-200/30 bg-warning-950/95 px-4 py-4 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:px-6"
      role="alert"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
    >
      {/* X close button top-right */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-warning-800/60 text-warning-200 hover:bg-warning-700 transition-colors text-lg font-bold"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-3xl">🛡️</span>
        <div className="sm:hidden">
          <p className="font-bold text-warning-400">Ad Blocker Recommended</p>
        </div>
      </div>

      <div className="flex-1">
        <p className="hidden font-bold text-warning-400 sm:block">
          Ad Blocker Recommended
        </p>
        <p className="text-sm text-warning-100/80">
          This site uses third-party players that may show ads or pop-ups.
          Install{" "}
          <Link
            isExternal
            showAnchorIcon
            href="https://ublockorigin.com/"
            className="font-semibold text-warning-300 underline underline-offset-2"
            size="sm"
          >
            uBlock Origin
          </Link>{" "}
          or{" "}
          <Link
            isExternal
            showAnchorIcon
            href="https://adguard-dns.io/"
            className="font-semibold text-warning-300 underline underline-offset-2"
            size="sm"
          >
            AdGuard DNS (dns.adguard.com)
          </Link>{" "}
          for the best experience.
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          as={Link}
          isExternal
          href="https://adguard-dns.io/"
          size="sm"
          color="warning"
          variant="solid"
          className="font-semibold"
        >
          Use AdGuard DNS
        </Button>
      </div>
    </div>
  );
};

export default AdBlockerPrompt;
