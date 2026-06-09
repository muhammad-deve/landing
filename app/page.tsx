import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { InstallSection } from "@/components/install-section";
import { Features } from "@/components/features";
import { TunnelDiagram } from "@/components/tunnel-diagram";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { PageBackground } from "@/components/page-background";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <PageBackground />
      <SiteNav />

      <main className="flex-1">
        <Hero />

        <InstallSection />

        <Features />

        <section id="how-it-works" className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              One command opens an encrypted path from the public internet straight to your
              localhost.
            </p>
          </div>
          <TunnelDiagram />
        </section>

        {/* FAQ stays at the very bottom */}
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
