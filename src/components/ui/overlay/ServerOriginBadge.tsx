"use client";

import { cn } from "@/utils/helpers";
import { useEffect, useState } from "react";

/**
 * Small floating badge that shows whether the current page is being
 * served by the phone-hosted origin or the Vercel fallback. Reads the
 * `x-served-by` cookie set by the vdomov-failover Cloudflare Worker.
 * Renders nothing if the cookie isn't present (e.g. local/dev, or when
 * not going through the failover Worker at all).
 */
const ServerOriginBadge: React.FC = () => {
  const [servedBy, setServedBy] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )x-served-by=([^;]*)/);
    if (match) setServedBy(decodeURIComponent(match[1]));
  }, []);

  if (!servedBy) return null;

  const isPhone = servedBy === "phone";

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-2 right-2 z-9999 flex select-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-md backdrop-blur-md",
        isPhone ? "bg-success-500/20 text-success-600" : "bg-warning-500/20 text-warning-600",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isPhone ? "bg-success-500" : "bg-warning-500")} />
      {isPhone ? "Server: Phone" : "Server: Vercel (fallback)"}
    </div>
  );
};

export default ServerOriginBadge;
