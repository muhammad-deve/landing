import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/section-header";

const FAQS = [
  {
    q: "Is GoPort really free?",
    a: "Yes. GoPort is completely free and open source under the MIT license. There are no metered tunnels, paywalled features, or hidden fees. You can also self-host it on your own infrastructure.",
  },
  {
    q: "How is GoPort different from ngrok?",
    a: "GoPort gives you the same instant public URLs for localhost, but it's open source and fully self-hostable. You own your tunnels, domains, and data — no vendor lock-in and no usage limits.",
  },
  {
    q: "Do I need to configure port forwarding or a public IP?",
    a: "No. The GoPort agent opens a secure outbound connection to the cloud, so it works behind NAT and firewalls without any port forwarding, router changes, or a public IP address.",
  },
  {
    q: "Can I use my own custom domain?",
    a: "Absolutely. You can request a memorable subdomain like myapp.goport.uz, or point a fully custom domain at your tunnel for a production-like setup.",
  },
  {
    q: "Does it support WebSockets and streaming?",
    a: "Yes. GoPort detects HTTP upgrade requests and switches to raw bidirectional forwarding, so WebSocket apps, server-sent events, and streaming responses work seamlessly.",
  },
  {
    q: "How do I install it?",
    a: "Use your platform's package manager — brew install goport on macOS, choco install goport on Windows, or the install script on Linux. Then run goport http 8080 to expose your local server.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-24">
      <SectionHeader className="mb-12" title="FAQ" titleClassName="text-primary" />

      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, i) => (
          <AccordionItem
            key={faq.q}
            value={`item-${i}`}
            className="border-border/60"
          >
            <AccordionTrigger className="cursor-pointer py-5 text-base text-foreground hover:no-underline hover:text-primary">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
