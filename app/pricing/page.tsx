import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { Pricing } from "@/components/home-sections";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare GoPort Free and Pro plans for active tunnels, monthly traffic, custom subdomains, request inspection, and connected devices.",
  alternates: { canonical: "/pricing" },
  openGraph: { url: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="pricing"
        title="Start with a tunnel. Pay when you need more room."
        description="Every plan includes HTTPS, WebSockets, and the local request inspector. Upgrade for more tunnels, traffic, devices, and a custom GoPort subdomain."
        command="$ goport http 8080"
        output="Free: 2 tunnels / 5 GB  →  Pro: 10 tunnels / 70 GB"
        primaryLabel="Start free"
      />
      <Pricing />
      <Faq />
    </MarketingPage>
  );
}
