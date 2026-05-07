import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kalstudio.online'),
  title: "Kal Studio — Web Design & Development Agency for Modern Brands",
  description:
    "Kal Studio is a premium web design and development agency specializing in custom websites, landing pages, multi-page funnels, UI/UX design, and digital architecture for businesses in India and beyond. We build fast, SEO-optimized digital experiences that drive growth.",
  keywords: [
    "web design agency",
    "web development company",
    "website design for businesses",
    "landing page design",
    "multi-page website development",
    "UI UX design agency",
    "digital architecture",
    "custom website development India",
    "web design Kolkata",
    "business website services",
    "SEO optimization services",
    "conversion focused web design",
    "website redesign services",
    "ecommerce web development",
    "responsive web design",
    "full stack web development",
    "brand identity web design",
    "affordable web design India",
    "corporate website design",
    "web design studio",
  ],
  authors: [{ name: "Kal Studio" }],
  creator: "Kal Studio",
  publisher: "Kal Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Kal Studio",
    title: "Kal Studio — Web Design & Development Agency for Modern Brands",
    description:
      "Premium web design and development agency building fast, SEO-optimized digital experiences for businesses in India and globally. Custom websites, landing pages, and digital architecture.",
    url: "https://www.kalstudio.online",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kal Studio — Web Design & Development Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kal Studio — Web Design & Development Agency",
    description:
      "Premium web design and development agency building fast, SEO-optimized digital experiences for modern brands.",
    images: ["/og-image.png"],
    creator: "@kalstudio",
  },
  icons: {
    icon: "/icon.png?v=2",
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  category: "technology",
};

import SmoothScroll from "@/components/providers/SmoothScroll";
import JsonLd from "@/components/seo/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="canonical" href="https://www.kalstudio.online" />
      </head>
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
