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
    q: "What happens when I hit the 5 GB Free limit?",
    a: "GoPort stops opening new tunnels for the rest of the calendar month and the CLI tells you the limit was reached. Nothing is deleted and no charge is applied. Your allowance resets at the start of the next month, or you can upgrade to Pro for 70 GB per month.",
  },
  {
    q: "Can I self-host GoPort for free?",
    a: "Yes. GoPort is MIT licensed and the tunnel server is in the same repository as the CLI. Run it on your own machine with your own wildcard domain and there are no plan limits, no account, and no payment. The hosted plans exist for people who would rather not run the server themselves.",
  },
  {
    q: "How do payments work, and can I cancel?",
    a: "Payments are processed by Lemon Squeezy, our merchant of record, which accepts major credit and debit cards and PayPal. You can cancel Pro at any time from your dashboard; your plan stays active until the end of the period you have already paid for, and you are not charged again. If a charge looks wrong, email us and we will resolve it through Lemon Squeezy. Click, Payme, and MultiCard appear on this site as examples of webhooks you can test through a tunnel, not as GoPort payment methods.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-7 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:py-18">
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
