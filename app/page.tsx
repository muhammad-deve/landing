import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { InstallSection } from "@/components/install-section";
import { Features } from "@/components/features";
import { TunnelDiagram } from "@/components/tunnel-diagram";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { PageBackground } from "@/components/page-background";
import { SectionHeader } from "@/components/section-header";

export default function Home() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <PageBackground />
      <SiteNav />

      <main className="relative z-10 flex-1">
        <Hero />

        <InstallSection />

        <Features />

        <section id="how-it-works" className="mx-auto w-full max-w-5xl px-6 py-24">
          <SectionHeader className="mb-14" title="How it works" />
          <TunnelDiagram />
        </section>

        {/* FAQ stays at the very bottom */}
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
