import { Metadata } from "next/types";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Khmer Dubbed Player | ${siteConfig.name}`,
};

export default async function KhmerDubbedPlayerPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Await the params Promise required in Next.js 15+
  const resolvedParams = await params;
  // slug is an array, e.g. ['tvshows', 'the-rebel']
  const asiadramaPath = resolvedParams.slug.join('/');
  
  // Use our new proxy API to inject VDOMov styles and hide asiadrama branding
  const iframeUrl = `/api/asiadrama/proxy?slug=${asiadramaPath}`;

  return (
    <main className="flex h-[calc(100vh-64px)] w-full flex-col bg-[#0a0f16]">
      <div className="flex-1 w-full h-full relative mx-auto max-w-7xl">
        {/* We use an iframe to load the proxy which renders the Asiadrama page but fully styled to match VDOMov */}
        <iframe
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0 rounded-xl overflow-hidden"
          allowFullScreen
          allow="autoplay; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        />
      </div>
    </main>
  );
}
