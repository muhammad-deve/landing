import type { Metadata } from "next";

export const SITE_URL = "https://goport.uz";
export const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;
export const SECURITY_URL = `${GITHUB_URL}/blob/main/SECURITY.md`;
export const SECURITY_MODEL_URL = `${GITHUB_URL}/blob/main/docs/security-model.md`;
export const BENCHMARKS_SOURCE_URL = `${GITHUB_URL}/tree/main/benchmarks`;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;

const SHARE_IMAGE_ALT = "GoPort — expose localhost to the internet with one command";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
}

/**
 * Builds complete per-page metadata. A page that sets `openGraph` replaces the
 * layout's object instead of merging with it, so pages that only passed
 * `{ url }` were losing og:title, og:description and og:site_name. Building
 * the whole object here keeps every share card specific to its page.
 */
export function pageMetadata({ title, description, path, robots }: PageMetadataInput): Metadata {
  const fullTitle = `${title} | GoPort`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "GoPort",
      url: path,
      title: fullTitle,
      description,
      // The generated card in app/opengraph-image.tsx only attaches itself to
      // pages that don't set their own openGraph, so name it explicitly.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SHARE_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: "/twitter-image", alt: SHARE_IMAGE_ALT }],
    },
    ...(robots ? { robots } : {}),
  };
}

/** Site-wide entities, emitted once from the root layout. */
export const SITE_STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "GoPort",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: "support@contact.goport.uz",
    sameAs: [GITHUB_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "GoPort",
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  },
];

/**
 * The software itself. Only facts that can be checked in the repository:
 * no ratings, review counts, download counts or user numbers.
 */
export const SOFTWARE_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": SOFTWARE_ID,
  name: "GoPort",
  url: SITE_URL,
  description:
    "An open-source, self-hostable localhost tunnel that gives local apps, APIs, and webhook handlers a public HTTPS URL.",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Localhost tunneling",
  operatingSystem: "Windows, macOS, Linux",
  softwareHelp: `${GITHUB_URL}#readme`,
  downloadUrl: `${GITHUB_URL}/releases/latest`,
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  publisher: { "@id": ORGANIZATION_ID },
  sameAs: [GITHUB_URL],
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro monthly", price: "2.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro yearly", price: "19.99", priceCurrency: "USD" },
  ],
};

/** Serializes JSON-LD safely for an inline script tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
