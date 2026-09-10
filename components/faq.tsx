import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/section-header";

export const FAQS = [
  {
    q: "What is GoPort?",
    a: "GoPort is a localhost tunnel for developers. It forwards traffic from a public HTTPS URL to an app running on your computer, so you can test webhooks, share a preview, or reach a local API without deploying it first.",
  },
  {
    q: "How do I expose localhost to the internet with GoPort?",
    a: "Install the GoPort CLI, authenticate it with a token from your account, and run goport http 8080. Replace 8080 with your app's local port. GoPort prints the public HTTPS URL as soon as the tunnel connects.",
  },
  {
    q: "Can I test webhooks on localhost?",
    a: "Yes. Use your GoPort URL as the webhook endpoint in Stripe, GitHub, Payme, Click, or another service. Each delivery is forwarded to your local handler, where you can inspect the request and response and replay captured requests after a code change.",
  },
  {
    q: "Do I need a public IP or port forwarding?",
    a: "No. The GoPort CLI opens an outbound connection from your machine. You do not need to open an inbound router port, change firewall rules, or assign a public IP to your computer.",
  },
  {
    q: "Can I keep the same public URL?",
    a: "Yes. Request an available GoPort subdomain with the --custom flag when you need a stable callback or preview URL. Use --reset when you want GoPort to assign a new random subdomain.",
  },
  {
    q: "Does GoPort support WebSockets?",
    a: "Yes. The GoPort CLI detects HTTP upgrade requests and switches to bidirectional forwarding, allowing WebSocket connections to pass through the same public tunnel.",
  },
  {
    q: "Can I inspect and replay requests?",
    a: "Yes. GoPort runs a local dashboard that records request and response details for the active tunnel. You can review headers and bodies, check status codes and latency, and replay a captured request against your local app.",
  },
  {
    q: "Is GoPort an open-source ngrok alternative?",
    a: "GoPort's CLI and tunnel server are available under the MIT License, and the infrastructure can be self-hosted. GoPort focuses on a direct developer workflow for public HTTPS tunnels, local request inspection, and memorable subdomains.",
  },
  {
    q: "Can I cancel a paid plan at any time?",
    a: "Yes. You can cancel a paid plan at any time. Your plan stays active through the current billing period and will not renew after that period ends.",
  },
  {
    q: "Is a GoPort tunnel private?",
    a: "Traffic uses HTTPS, but the public URL is reachable from the internet. Keep authentication enabled in your app, avoid exposing sensitive development tools, and close the tunnel when you no longer need it.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid w-full max-w-7xl scroll-mt-20 gap-10 px-5 py-20 sm:px-7 lg:grid-cols-[0.65fr_1.35fr] lg:py-28">
      <SectionHeader
        eyebrow="FAQ"
        title="What developers ask before opening a tunnel."
        description="Clear answers about setup, webhook testing, public access, billing, and self-hosting."
        align="left"
        className="lg:sticky lg:top-28 lg:self-start"
      />
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
