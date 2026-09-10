import type { Metadata } from "next";
import { Features } from "@/components/features";
import { CompatibleServices, DocsOverview } from "@/components/home-sections";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Product",
  description: "Explore GoPort's public HTTPS tunnels, local request inspector, WebSocket support, custom subdomains, and self-hosting options.",
  alternates: { canonical: "/product" },
  openGraph: { url: "/product" },
};

export default function ProductPage() {
  return (
    <MarketingPage>
      <Features />
      <CompatibleServices />
      <DocsOverview />
    </MarketingPage>
  );
}
