import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goport.uz"),
  title: {
    default: "GoPort: Expose Localhost to the Internet with HTTPS",
    template: "%s | GoPort",
  },
  description:
    "Expose localhost to the internet with a public HTTPS URL. GoPort is an open-source, self-hostable tunnel for apps, APIs, webhooks, and demos.",
  applicationName: "GoPort",
  authors: [{ name: "GoPort" }],
  creator: "GoPort",
  publisher: "GoPort",
  category: "developer tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GoPort",
    title: "GoPort: Expose Localhost to the Internet with HTTPS",
    description:
      "Create a public HTTPS URL for a local app, API, or webhook handler with one command.",
  },
  twitter: {
    card: "summary",
    title: "GoPort: Expose Localhost to the Internet with HTTPS",
    description:
      "Create a public HTTPS URL for a local app, API, or webhook handler with one command.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#11191e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4RDRG6148J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4RDRG6148J');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
