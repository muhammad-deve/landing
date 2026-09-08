import { AuthRedirect } from "@/components/auth-redirect";
import { Faq } from "@/components/faq";
import { CompatibleServices, DeveloperSignals, DocsOverview, FinalCta, MainFeatures, Pricing, Quickstart, TrustSignals, UseCases } from "@/components/home-sections";
import { Hero } from "@/components/hero";
import { PageBackground } from "@/components/page-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <AuthRedirect />
      <PageBackground />
      <SiteNav />

      <main className="relative z-10 flex-1">
        <Hero />
        <CompatibleServices />
        <MainFeatures />
        <UseCases />
        <Quickstart />
        <DocsOverview />
        <DeveloperSignals />
        <Pricing />
        <TrustSignals />
        <FinalCta />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
