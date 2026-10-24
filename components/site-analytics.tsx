"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { isPrivatePath } from "@/lib/private-paths";

const GA_ID = "G-4RDRG6148J";
const UMAMI_ID = "f19434a8-bf0e-4b94-9bcd-e7980e56aac0";

// GA gets the first page view without the query string. Later client-side
// page views come from GA's own history tracking.
const GA_INIT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });
gtag('event', 'page_view', { page_location: location.origin + location.pathname, page_title: document.title });
`;

/** Loads analytics on public pages only. */
export function SiteAnalytics() {
  const pathname = usePathname();
  const isPrivate = isPrivatePath(pathname);
  const loaded = useRef(false);

  useEffect(() => {
    if (!isPrivate) {
      loaded.current = true;
      return;
    }
    // Loaded scripts can't be removed. If a client-side navigation reached a
    // private page after they ran, reload so the page starts without them.
    if (loaded.current) window.location.reload();
  }, [isPrivate]);

  if (isPrivate) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {GA_INIT}
      </Script>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id={UMAMI_ID}
        data-exclude-search="true"
        strategy="afterInteractive"
      />
      {process.env.NODE_ENV === "production" && (
        <Analytics
          beforeSend={(event) => {
            const url = new URL(event.url);
            if (isPrivatePath(url.pathname)) return null;
            url.search = "";
            return { ...event, url: url.toString() };
          }}
        />
      )}
    </>
  );
}
