import type { Metadata } from "next";
import { CompatibleServices, UseCases } from "@/components/home-sections";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Use Cases",
  description: "Use GoPort to test webhooks, payment callbacks, OAuth redirects, mobile apps, local APIs, and client previews without deploying first.",
  alternates: { canonical: "/use-cases" },
  openGraph: { url: "/use-cases" },
};

export default function UseCasesPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="use-cases"
        title="Test the real event before you ship the code."
        description="Give providers, devices, teammates, and clients a public URL while the application they reach is still running locally."
        command="POST /webhooks/payment"
        output="provider  →  GoPort HTTPS  →  localhost:3000/webhooks/payment"
      />
      <UseCases />
      <CompatibleServices />
    </MarketingPage>
  );
}
