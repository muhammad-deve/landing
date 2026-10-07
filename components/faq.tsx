import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/section-header";

export const FAQS = [
  {
    q: "What is GoPort?",
    a: "A localhost tunnel. It gives an app on your computer a public HTTPS URL, so you can test webhooks or share a preview without deploying.",
  },
  {
    q: "How do I expose localhost to the internet with GoPort?",
    a: "Install the CLI, run goport auth <token> once, then goport http 8080 with your app's port. GoPort prints the public URL.",
  },
  {
    q: "Can I test webhooks on localhost?",
    a: "Yes. Set your GoPort URL as the webhook endpoint in Stripe, GitHub, Payme, or any provider. Deliveries reach your local handler, and you can replay them.",
  },
  {
    q: "Do I need a public IP or port forwarding?",
    a: "No. The CLI connects outbound, so there are no router ports, firewall rules, or public IPs to set up.",
  },
  {
    q: "Can I keep the same public URL?",
    a: "Yes, on Pro. Use --custom to claim a subdomain, or --reset for a new random one.",
  },
  {
    q: "What happens when I hit the 5 GB Free limit?",
    a: "New tunnels stop opening until the month resets. Nothing is deleted and you are never charged.",
  },
  {
    q: "Can I self-host GoPort for free?",
    a: "Yes. GoPort is MIT licensed. Run the server on your own domain with no limits, account, or payment.",
  },
  {
    q: "How do payments work, and can I cancel?",
    a: "Lemon Squeezy handles payments by card or PayPal. Cancel anytime from the dashboard and keep Pro until your paid period ends.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid w-full max-w-7xl -scroll-mt-14 gap-10 px-5 py-14 sm:px-7 lg:-scroll-mt-18 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:py-18">
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
