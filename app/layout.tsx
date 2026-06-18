import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import ServiceWorker from "@/components/ServiceWorker";
import AppChrome from "@/components/AppChrome";
import FreshOnRestore from "@/components/FreshOnRestore";
import { RouteProgress } from "@/components/RouteProgress";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
  themeColor: "#c8362f",
  width: "device-width",
  initialScale: 1,
};

// Role drives which nav the app shell shows. Returns null for signed-out or
// not-yet-onboarded users, in which case no shell is rendered.
async function getNavRole(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, onboardingComplete: true },
  });
  if (!user || !user.onboardingComplete) return null;
  return user.role;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const role = await getNavRole();
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${bricolage.variable}`}>
      <body>
        <FreshOnRestore />
        <RouteProgress />
        <AppChrome role={role}>{children}</AppChrome>
        <ServiceWorker />
      </body>
    </html>
  );
}
