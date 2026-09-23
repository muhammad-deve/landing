import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LegalPage, type LegalClause } from "@/components/legal-page";

const MAIL = `mailto:${LEGAL_CONTACT_EMAIL}`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data GoPort collects when you use goport.uz and the tunnel service, why, who processes it, and how to access or delete it.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

const SUMMARY = [
  "We relay your tunnel traffic but don’t store its contents. The Request Inspector keeps its data on your machine.",
  "We keep what’s needed to run your account: name, email, tokens, tunnels, and usage counts.",
  "Payments go through Lemon Squeezy. We never see your full card number.",
  "We don’t sell your data. Email us to get a copy of it or to delete your account.",
];

const CLAUSES: LegalClause[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <p>
        This Privacy Policy explains how GoPort (“GoPort”, “we”, “us”) collects, uses, and shares personal data when
        you visit goport.uz, use the dashboard or API, or open tunnels with the <code>goport</code> CLI (together,
        the “Service”). It should be read together with our <Link href="/terms">Terms of Service</Link>. It does not
        cover GoPort servers that other people host themselves; whoever runs such a server is responsible for it.
      </p>
    ),
  },
  {
    id: "role",
    title: "Our role",
    body: (
      <>
        <p>
          For your account, billing, and website data, GoPort decides how and why the data is processed, and acts as
          the controller.
        </p>
        <p>
          For the traffic that passes through your tunnels, we only relay it to your machine on your instructions. If
          that traffic contains other people’s personal data, you are responsible for having a lawful basis to process
          it, and we act on your behalf.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: (
      <>
        <p>
          <strong>Account data.</strong> Your name, email address, and password when you sign up with email. Passwords
          are stored only as a salted hash. If you sign in with Google, we receive your name and email address from
          Google. We also send one-time codes to your email to verify it and to reset your password.
        </p>
        <p>
          <strong>Tokens and devices.</strong> The auth tokens you create, their names, and when they were created,
          which we use to count and limit the devices connected to your account.
        </p>
        <p>
          <strong>Tunnel and usage data.</strong> Your tunnels’ subdomains and addresses, when they were opened and
          closed, and the number of requests and bytes they carried over time. We use this to enforce plan limits and
          to show usage charts in your dashboard.
        </p>
        <p>
          <strong>Connection data.</strong> The IP address and port your CLI connects from, and technical logs from our
          servers and API, such as request times and errors.
        </p>
        <p>
          <strong>Billing data.</strong> Your plan, subscription status, renewal dates, and the customer and
          subscription identifiers that Lemon Squeezy gives us. Lemon Squeezy collects your payment details and billing
          address directly; we don’t receive your full card number.
        </p>
        <p>
          <strong>Website analytics.</strong> When you browse goport.uz, Google Analytics and Vercel Analytics record
          pages visited, referrer, approximate location derived from your IP address, and device and browser type.
        </p>
        <p>
          <strong>Messages you send us.</strong> The contents of emails to support, and your email address if you join
          an early-access or waiting list.
        </p>
      </>
    ),
  },
  {
    id: "tunnel-traffic",
    title: "Tunnel traffic",
    body: (
      <>
        <p>
          Requests and responses that pass through your tunnels are relayed in real time. We do not store their
          headers or bodies, and we don’t look at them except as needed to route them, to count bytes against your
          limit, or to investigate a specific abuse report.
        </p>
        <p>
          The Request Inspector runs inside the CLI on your own computer. The requests it records stay on your machine
          and are never uploaded to us.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your data",
    body: (
      <>
        <p>We use personal data to:</p>
        <ul>
          <li>create and secure your account, and sign you in;</li>
          <li>open tunnels, route traffic, and reserve your subdomains;</li>
          <li>measure usage and enforce plan limits;</li>
          <li>process subscriptions, trials, cancellations, and refunds through Lemon Squeezy;</li>
          <li>send account emails, such as verification codes, password resets, and billing or policy notices;</li>
          <li>answer your support requests;</li>
          <li>detect, investigate, and stop abuse, fraud, and attacks on the Service;</li>
          <li>understand how the website is used so we can improve it;</li>
          <li>comply with the law and enforce our Terms.</li>
        </ul>
        <p>We don’t use your data for advertising, and we don’t sell it.</p>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal bases",
    body: (
      <p>
        Where laws such as the GDPR apply, we process your data because it is necessary to provide the Service you
        signed up for (contract); for our legitimate interests in keeping the Service secure, preventing abuse, and
        improving it; to meet legal obligations such as tax and accounting rules; and, where we ask for it, with your
        consent, which you can withdraw at any time.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We share personal data only with service providers who help us run GoPort, and only as much as they need:</p>
        <ul>
          <li><strong>Lemon Squeezy</strong>, our merchant of record, for payments, taxes, and invoices;</li>
          <li><strong>Google</strong>, for Google sign-in, Google Analytics, and storing early-access sign-ups;</li>
          <li><strong>Vercel</strong>, for website analytics;</li>
          <li><strong>Resend</strong>, for sending account emails;</li>
          <li>our hosting and infrastructure providers, which run the servers the Service is on.</li>
        </ul>
        <p>
          We may also disclose data if the law requires it, to respond to a valid legal request, to protect the rights
          and safety of our users or others, or as part of a merger or sale of the Service, in which case this policy
          will continue to apply to your data.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <>
        <p>
          The website stores your sign-in session and theme preference in your browser’s local storage, and uses
          session storage briefly during Google sign-in. These are needed for the site to work.
        </p>
        <p>
          Google Analytics sets cookies to tell visits apart. Vercel Analytics does not use cookies. You can block or
          delete cookies in your browser settings, or use Google’s opt-out browser add-on, without affecting your
          ability to use GoPort.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <p>
          We keep account, token, tunnel, and usage data for as long as your account is open. Server logs, including
          connection IP addresses, are kept only as long as needed for security and troubleshooting.
        </p>
        <p>
          When you ask us to delete your account, we delete or anonymize your personal data within 30 days. We may keep
          some records longer where the law requires it, for example billing records for tax purposes, or where we need
          them to resolve a dispute or prevent abuse.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        We use reasonable technical and organizational measures to protect your data, including HTTPS for all
        connections, hashed passwords, and auth tokens you can revoke at any time. No system is perfectly secure, so we
        can’t guarantee absolute security. Keep your password and tokens private, and protect the applications you
        expose through tunnels.
      </p>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <p>
        GoPort and its service providers may process your data in countries other than your own, including the United
        States. Where the law requires it, we rely on appropriate safeguards for these transfers, such as standard
        contractual clauses offered by our providers.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access your personal data, correct it, delete it,
          receive a copy in a portable format, restrict or object to how we process it, and withdraw consent. You can
          change your email and password in the dashboard at any time.
        </p>
        <p>
          For anything else, email <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a> from the address on your account. We will
          reply within 30 days. You also have the right to complain to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        The Service is not meant for anyone under 16, and we don’t knowingly collect personal data from them. If you
        believe a child has given us personal data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the Service changes. When we do, we will change the effective date at the top of
        this page, and for material changes we will notify account holders by email or in the dashboard before they
        take effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about this policy or your data go to <a href={MAIL}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="2026-09-23"
      intro={
        <p>
          What we collect when you use goport.uz and the tunnel service, why we collect it, and how you can see or
          delete it.
        </p>
      }
      summary={SUMMARY}
      clauses={CLAUSES}
      related={{ label: "Read the Terms of Service", href: "/terms" }}
    />
  );
}
