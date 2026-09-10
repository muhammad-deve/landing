import type { Metadata } from "next";
import { Features } from "@/components/features";
import { CompatibleServices, DocsOverview } from "@/components/home-sections";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Product",
  description: "Explore GoPort's public HTTPS tunnels, local request inspector, WebSocket support, custom subdomains, and self-hosting options.",
  alternates: { canonical: "/product" },
  openGraph: { url: "/product" },
};

export default function ProductPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="product"
        title="The shortest route from the internet to localhost."
        description="Open a public HTTPS tunnel with one command, inspect the traffic beside your app, and keep the development loop on your machine."
        command="$ goport http 3000"
        output="https://project.goport.uz  →  http://localhost:3000"
      />
      <Features />
      <CompatibleServices />
      <DocsOverview />
    </MarketingPage>
  );
}
