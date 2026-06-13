import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { InstallSection } from "@/components/install-section";
import { Features } from "@/components/features";
import { TunnelDiagram } from "@/components/tunnel-diagram";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { PageBackground } from "@/components/page-background";
import { SectionHeader } from "@/components/section-header";
import { SectionDivider } from "@/components/section-divider";
import { AuthRedirect } from "@/components/auth-redirect";

export default function Home() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <AuthRedirect />
      <PageBackground />
      <SiteNav />

      <main className="relative z-10 flex-1">
        <Hero />

        <SectionDivider marker="01" label="install" />
        <InstallSection />

        <SectionDivider marker="02" label="features" />
        <Features />

        <SectionDivider marker="03" label="how it works" />
        <section id="how-it-works" className="mx-auto w-full max-w-5xl px-6 py-24">
          <SectionHeader
            className="mb-14"
            eyebrow="Under the hood"
            title="One command, one secure tunnel"
            description="Follow a request from the open internet all the way to your localhost — no port forwarding, no public IP, no config."
          />
          <TunnelDiagram />
        </section>

        <SectionDivider marker="04" label="faq" />
        {/* FAQ stays at the very bottom */}
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
