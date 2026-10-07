import type { Metadata } from "next";
import { AuthRedirect } from "@/components/auth-redirect";
import { Faq, FAQS } from "@/components/faq";
import { CompatibleServices, DocsOverview, Pricing, Quickstart, UseCases } from "@/components/home-sections";
import { Hero } from "@/components/hero";
import { PageBackground } from "@/components/page-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "GoPort",
      url: "https://goport.uz",
      description:
        "An open-source, self-hostable localhost tunnel that gives local apps, APIs, and webhook handlers a public HTTPS URL.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      softwareHelp: "https://github.com/muhammad-deve/GoPort#readme",
      downloadUrl: "https://github.com/muhammad-deve/GoPort/releases/latest",
      license: "https://github.com/muhammad-deve/GoPort/blob/main/LICENSE",
      sameAs: ["https://github.com/muhammad-deve/GoPort"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan",
      },
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
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
