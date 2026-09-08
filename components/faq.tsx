import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/section-header";

const FAQS = [
  { q: "Can I start with GoPort for free?", a: "Yes. The Free plan lets you open routes and try GoPort with a local project. The CLI is also open source under the MIT license, and you can self-host the infrastructure." },
  { q: "How is GoPort different from ngrok?", a: "GoPort is an open-source tunnel for local development. You can inspect the CLI, self-host the infrastructure, and use a public HTTPS URL for the services running on your machine." },
  { q: "Do I need port forwarding or a public IP?", a: "No. The GoPort agent creates an outbound connection, so your local app can receive routed traffic without opening an inbound port or changing your router." },
  { q: "Can I use my own custom domain?", a: "Yes. GoPort supports memorable subdomains and custom domains for projects that need a stable public address." },
  { q: "Does it support WebSockets and streaming?", a: "Yes. GoPort forwards HTTP upgrade requests and long-lived connections, so WebSockets, server-sent events, and streaming responses can pass through the tunnel." },
  { q: "How do I install it?", a: "Install the GoPort CLI through your platform package manager, authenticate it, then run goport http 8080 to route your local server." },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-7 lg:grid-cols-[0.65fr_1.35fr] lg:py-28">
      <SectionHeader eyebrow="FAQ" title="Questions before you route it?" description="The short answers for setting up a local public URL." align="left" />
      <Accordion type="single" collapsible className="border-y border-border">
        {FAQS.map((faq, index) => (
          <AccordionItem key={faq.q} value={`item-${index}`} className="border-border">
            <AccordionTrigger className="cursor-pointer py-5 text-left text-base font-medium text-foreground hover:no-underline hover:text-primary">{faq.q}</AccordionTrigger>
            <AccordionContent className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
