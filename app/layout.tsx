import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE = "https://drivinginstructorsplymouth.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Driving Instructors Plymouth | Find & Book a Local Instructor",
    template: "%s | Driving Instructors Plymouth",
  },
  description:
    "Compare and book vetted local driving instructors in Plymouth. Real prices, real availability, lessons booked in minutes — covering Plymouth, Plympton, Plymstock, Saltash, Ivybridge and Tavistock.",
  applicationName: "Driving Instructors Plymouth",
  keywords: [
    "driving instructors Plymouth",
    "driving lessons Plymouth",
    "driving school Plymouth",
    "learn to drive Plymouth",
    "driving instructor near me",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DI Plymouth",
  },
  openGraph: {
    title: "Driving Instructors Plymouth | Find & Book a Local Instructor",
    description:
      "Find and book a vetted local driving instructor across Plymouth and South West Devon.",
    url: SITE,
    siteName: "Driving Instructors Plymouth",
    type: "website",
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d2a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${bricolage.variable}`}>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
