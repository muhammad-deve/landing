import type { Metadata } from "next";
import { AuthRedirect } from "@/components/auth-redirect";
import { Faq, FAQS } from "@/components/faq";
import { CompatibleServices, DocsOverview, Pricing, Quickstart, UseCases } from "@/components/home-sections";
import { Hero } from "@/components/hero";
import { PageBackground } from "@/components/page-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { jsonLd, SOFTWARE_STRUCTURED_DATA } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const structuredData = [
    SOFTWARE_STRUCTURED_DATA,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <AuthRedirect />
      <PageBackground />
      <SiteNav />

      <main className="relative z-10 flex-1">
        <Hero />
        <CompatibleServices />
        <UseCases />
        <Quickstart />
        <DocsOverview />
        <Pricing />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  );
}
