import type { Metadata } from "next";
import { DocsOverview, Quickstart } from "@/components/home-sections";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Install the GoPort CLI, authenticate your machine, and expose a local app through a public HTTPS URL in four steps.",
  alternates: { canonical: "/quickstart" },
  openGraph: { url: "/quickstart" },
};

export default function QuickstartPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="quickstart"
        title="From localhost to public HTTPS in four steps."
        description="Install the CLI, create a token, authenticate once, and point GoPort at the port your application already uses."
        command="$ goport auth &lt;token&gt;  &&  goport http 3000"
        output="Tunnel ready: https://project.goport.uz"
        primaryLabel="Create an account"
      />
      <Quickstart />
      <DocsOverview />
    </MarketingPage>
  );
}
