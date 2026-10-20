import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Features } from "@/components/features";
import { CompatibleServices, DocsOverview } from "@/components/home-sections";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = pageMetadata({
  title: "Product",
  description:
    "Explore GoPort's public HTTPS tunnels, local request inspector, WebSocket support, custom subdomains, and self-hosting options.",
  path: "/product",
});

export default function ProductPage() {
  return (
    <MarketingPage>
      <Features />
      <CompatibleServices />
      <DocsOverview />
    </MarketingPage>
  );
}
