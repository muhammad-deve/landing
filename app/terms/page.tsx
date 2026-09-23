import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LegalPage, type LegalClause } from "@/components/legal-page";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";
const MAIL = `mailto:${LEGAL_CONTACT_EMAIL}`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using the hosted GoPort tunneling service at goport.uz: accounts, acceptable use, plans and billing, liability, and termination.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
};

const SUMMARY = [
  "You’re responsible for everything you expose through a tunnel. No phishing, malware, or illegal content.",
  "Free: 1 tunnel and 5 GB a month. Pro: up to 10 tunnels and 70 GB a month. Limits are enforced automatically.",
  "Pro is billed through Lemon Squeezy. Cancel anytime and keep Pro until the end of the period you paid for.",
  "The hosted service comes with no uptime guarantee. For full control, self-host the MIT-licensed code.",
];

const CLAUSES: LegalClause[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <>
        <p>
          These Terms of Service (the “Terms”) are an agreement between you and GoPort (“GoPort”, “we”, “us”). They
          govern your access to and use of the hosted GoPort service, which includes the website at goport.uz, the
          dashboard, the API, the tunnel servers, and the <code>goport</code> command-line client when it connects to
          them (together, the “Service”).
        </p>
        <p>
          By creating an account, signing in with Google, or opening a tunnel, you agree to these Terms and to our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you use the Service on behalf of a company or other
          organization, you confirm that you are authorized to accept these Terms for it, and “you” refers to that
          organization as well. If you don’t agree, don’t use the Service.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "The Service",
    body: (
      <>
        <p>
          GoPort makes a server running on your machine reachable from the public internet. The CLI opens an outbound
          connection to our tunnel servers, and requests sent to your GoPort address (for example,{" "}
          <code>https://my-app.goport.uz</code>) are relayed through that connection to your local port.
        </p>
        <p>
          The Service is built for development, testing, webhooks, demos, and client previews. It is not designed as
          permanent production hosting, and you use it that way at your own risk.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and access",
    body: (
      <>
        <p>
          You need an account to open tunnels. You must give accurate information when you register and keep it up
          to date. You must be at least 16 years old, or the age of digital consent in your country if that is higher,
          and you must not be barred from using the Service under applicable law.
        </p>
        <p>
          You are responsible for keeping your password and auth tokens secret, and for all activity under your
          account, including tunnels opened from any device you connect. Anyone holding one of your tokens can open
          tunnels as you. Revoke a token from the dashboard as soon as you suspect it has leaked, and tell us if you
          believe your account has been compromised.
        </p>
        <p>
          One person or organization may not create multiple accounts to get around plan limits, and you may not
          share, sell, or transfer your account.
        </p>
      </>
    ),
  },
  {
    id: "exposed-services",
    title: "Services you expose",
    body: (
      <>
        <p>
          You decide what to make public through a tunnel, and you are solely responsible for it. Anyone who learns a
          tunnel address can send requests to it. Before exposing a service, make sure it is protected appropriately,
          for example with authentication, and that you have the right to make it available.
        </p>
        <p>
          Don’t expose credentials, private keys, payment card data, health records, other people’s personal data,
          or regulated systems unless you have the legal right to do so and suitable technical controls in place.
          GoPort does not replace application security.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You may not use the Service, or help anyone else use it, to:</p>
        <ul>
          <li>break any law or regulation, or infringe the rights of others, including intellectual property and privacy rights;</li>
          <li>host phishing pages, impersonate another person or service, or collect credentials or payment details under false pretenses;</li>
          <li>distribute malware, run botnet or command-and-control infrastructure, or send spam;</li>
          <li>scan, probe, attack, or overload any system you are not authorized to test;</li>
          <li>distribute content that is illegal, including child sexual abuse material, or content that promotes violence or fraud;</li>
          <li>get around plan limits, rate limits, or security measures, including by rotating accounts or tokens;</li>
          <li>resell, sublicense, or provide the hosted Service to third parties as your own product without our written permission;</li>
          <li>interfere with the Service, our infrastructure, or other users’ tunnels.</li>
        </ul>
      </>
    ),
  },
  {
    id: "enforcement",
    title: "Enforcement and abuse reports",
    body: (
      <>
        <p>
          Tunnel addresses are public and carry our domain, so abuse reports about them reach us. We may review
          account and usage information, and the metadata of connections to a tunnel, to investigate a suspected
          breach of these Terms.
        </p>
        <p>
          If we believe these Terms are being broken, or that a tunnel puts users, third parties, or the Service at
          risk, we may rate-limit or block traffic, close tunnels, reclaim subdomains, suspend or terminate accounts,
          and report activity to the relevant authorities where the law requires or allows it. Where it is safe and
          practical, we will tell you what happened.
        </p>
        <p>
          To report abuse, email <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a> with the full tunnel address, what you
          saw, and when.
        </p>
      </>
    ),
  },
  {
    id: "plans",
    title: "Plans, trials, and limits",
    body: (
      <>
        <p>
          The Free plan includes 1 active tunnel, 5 GB of traffic a month, a random GoPort address, and 1 connected
          device. Pro includes up to 10 active tunnels, 70 GB of traffic a month, custom GoPort subdomains, and up to
          5 connected devices. The <Link href="/pricing">pricing page</Link> always lists the current plans.
        </p>
        <p>
          When you reach a limit, the Service stops the action instead of charging you more: new tunnels won’t open,
          and traffic stops until the next monthly period. We may change the Free plan at any time. We won’t reduce
          what a paid plan includes during a period you have already paid for.
        </p>
        <p>
          The monthly Pro plan may start with a 7-day free trial, one per person. Custom subdomains are reserved for
          your account while Pro is active and may be released for others to claim after it ends.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments and taxes",
    body: (
      <>
        <p>
          Pro is sold as a monthly or yearly subscription. Payments are handled by Lemon Squeezy, which acts as the
          merchant of record: it processes your payment, collects any applicable sales tax or VAT, and issues your
          invoices. Lemon Squeezy’s own terms and privacy policy apply to the payment itself. We never see or store
          your full card number.
        </p>
        <p>
          By subscribing, you authorize recurring charges at the start of each billing period until you cancel. If
          you start with a trial, the first charge happens when the trial ends unless you cancel before then. If a
          payment fails, we may move your account to the Free plan until it is resolved.
        </p>
        <p>
          We may change prices. A new price applies from your next renewal, and we will tell you before it takes
          effect so you can cancel if you don’t accept it.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Cancellation and refunds",
    body: (
      <>
        <p>
          You can cancel at any time from the billing section of the dashboard, or by emailing us. Cancelling stops
          the next renewal. Pro stays active until the end of the period you have already paid for, and then your
          account moves to the Free plan.
        </p>
        <p>
          Payments are generally non-refundable, except where the law requires a refund or where these Terms say
          otherwise. If you were charged by mistake, for example for a renewal you had already cancelled, email{" "}
          <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a> within 30 days of the charge and we will review it. Approved
          refunds are issued through Lemon Squeezy to the original payment method.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "Your content and tunnel traffic",
    body: (
      <>
        <p>
          You keep all rights to the content you serve through your tunnels. You give us a limited right to receive,
          relay, and transmit that traffic only as needed to run the Service for you.
        </p>
        <p>
          We do not store the contents of requests and responses that pass through tunnels, and we don’t inspect
          them except as needed to route them, to enforce limits, or to investigate abuse. The Request Inspector runs
          inside the CLI on your own machine, so the requests it records stay there.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains what personal data we collect when you use the
        Service, how we use it, and the choices you have. It forms part of these Terms.
      </p>
    ),
  },
  {
    id: "open-source",
    title: "Open source and intellectual property",
    body: (
      <>
        <p>
          The GoPort source code is published under the{" "}
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer noopener">MIT license</a>. That
          license, not these Terms, governs what you may do with the code, including running your own server. These
          Terms apply only to the hosted Service we operate.
        </p>
        <p>
          The GoPort name, logo, and the goport.uz domain remain ours. You may not use them in a way that suggests we
          endorse or are affiliated with you or your project, and a self-hosted server must not present itself as the
          official GoPort service.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <p>
        The Service relies on third parties, including Google for sign-in, Lemon Squeezy for payments, and providers
        for email delivery, hosting, and analytics. Your use of their features may also be governed by their terms.
        Websites and services you reach through someone else’s tunnel are not ours, and we are not responsible for
        them.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability and support",
    body: (
      <>
        <p>
          We work to keep the Service running, but we don’t guarantee any level of uptime, performance, or response
          time unless we have agreed to it in writing. We may take the Service down for maintenance, and we may add,
          change, or remove features. If a change takes away something you pay for, we will tell you in advance.
        </p>
        <p>
          Support is by email at <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a>. If you need full control over uptime, you
          can run the whole stack yourself using the <Link href="/self-hosting">self-hosting guide</Link>.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: (
      <p>
        To the fullest extent permitted by law, the Service is provided “as is” and “as available”, without
        warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a
        particular purpose, title, and non-infringement. We don’t warrant that the Service will be uninterrupted,
        secure, or error-free, or that data sent through it will not be lost or intercepted.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, GoPort will not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising from or
          related to your use of the Service, even if we were told such damages were possible.
        </p>
        <p>
          Our total liability for all claims relating to the Service is limited to the greater of the amount you paid
          us for the Service in the 12 months before the event giving rise to the claim, or US$10.
        </p>
        <p>
          Some jurisdictions don’t allow certain limitations of liability. Nothing in these Terms limits liability that
          cannot be limited under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <p>
        You agree to defend and indemnify GoPort against any third-party claims, damages, and costs, including
        reasonable legal fees, that arise from the services and content you expose through the Service, from your
        breach of these Terms, or from your violation of any law or the rights of a third party.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <>
        <p>
          You can stop using the Service at any time. To close your account and have your data deleted, email{" "}
          <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a> from the address on your account.
        </p>
        <p>
          We may suspend or terminate your access if you break these Terms, don’t pay, create risk or legal exposure
          for us or others, or if we are required to by law. Where the problem can be fixed, we will usually warn you
          first. If we close a paid account for reasons that are not your fault, we will refund the unused part of
          your current billing period.
        </p>
        <p>
          When your account ends, your tunnels stop working and your subdomains are released. We may keep limited
          records afterwards for legal, security, and abuse-prevention reasons, as described in the Privacy Policy.
          Sections that by their nature should survive termination, including those on liability, indemnity, and
          governing law, continue to apply.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    body: (
      <p>
        These Terms are governed by the laws of the Republic of Uzbekistan, without regard to its conflict-of-law
        rules. Any dispute will be resolved by the competent courts of Tashkent, unless the mandatory consumer
        protection law of your country gives you the right to bring a claim where you live.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <p>
        We may update these Terms from time to time. When we do, we will change the effective date at the top of this
        page. For material changes, we will give reasonable notice by email or in the dashboard before they take
        effect. If you keep using the Service after that, the updated Terms apply. If you don’t agree, stop using the
        Service and cancel any subscription.
      </p>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <p>
        These Terms and the Privacy Policy are the entire agreement between you and GoPort about the Service. If any
        provision is found unenforceable, the rest remain in effect. Our failure to enforce a provision is not a
        waiver of it. You may not transfer these Terms without our consent; we may transfer them as part of a merger,
        acquisition, or sale of the Service. We may send you notices by email to the address on your account.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these Terms, abuse reports, and account requests go to{" "}
        <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="2026-09-23"
      intro={
        <p>
          These terms apply when you use the hosted service at goport.uz. If you run GoPort on your own server, the
          MIT license covers you instead.
        </p>
      }
      summary={SUMMARY}
      clauses={CLAUSES}
      related={{ label: "Read the Privacy Policy", href: "/privacy" }}
    />
  );
}
