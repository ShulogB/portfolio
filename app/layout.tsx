import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Space_Mono, Press_Start_2P } from "next/font/google";
import { content } from "@/lib/content";
import { LanguageProvider } from "@/context/LanguageContext";
import { LANG_COOKIE_NAME } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import TrackPageView from "@/components/TrackPageView";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const siteTitle = "Giuliano Bentevenga – Backend Engineer";
const siteDescription =
  "Backend engineer specialized in payments, identity, and distributed systems. Case studies, architecture decisions, and production-grade code.";

const baseUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://example.com";

const ogImageUrl = `${baseUrl}/opengraph-image`;

const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: `%s | Giuliano Bentevenga`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Giuliano Bentevenga",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get(LANG_COOKIE_NAME)?.value === "es" ? "es" : "en";
  const locale = lang === "es" ? "es_ES" : "en_US";
  const alternateLocale = lang === "es" ? "en_US" : "es_ES";
  return {
    ...defaultMetadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      locale,
      alternateLocale,
      url: lang === "es" ? `${baseUrl}?lang=es` : baseUrl,
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        "en": `${baseUrl}?lang=en`,
        "es": `${baseUrl}?lang=es`,
        "x-default": baseUrl,
      },
    },
  };
}

const jsonLdPerson = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: content.en.hero.name,
  jobTitle: "Senior Backend Engineer",
  description: siteDescription,
  url: baseUrl,
  knowsAbout: [
    "Distributed Systems",
    "Payments",
    "Identity",
    "Backend",
    "Transactional Systems",
    "Trust Boundaries",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get(LANG_COOKIE_NAME)?.value === "es" ? "es" : "en";

  return (
    <html lang={lang} className={`${spaceMono.variable} ${pressStart2P.variable}`}>
      <body className="min-h-screen font-sans bg-sega-bg text-sega-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
        <LanguageProvider>
          <LanguageToggle />
          <TrackPageView />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
