import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "StableEscrow | Licensed & Insured Blockchain Escrow Platform",
  description: "Secure escrow transactions platform for freelancers, teams, and businesses. Licensed, regulated & insured* blockchain-powered escrow with milestone payments and zero trust issues.",
  keywords: ["escrow", "blockchain", "secure payments", "milestone payments", "licensed escrow", "insured escrow", "freelance", "smart contracts"],
  authors: [{ name: "StableEscrow" }],
  creator: "StableEscrow",
  publisher: "StableEscrow",
  robots: "index, follow",
  metadataBase: new URL("https://escrow.nfigate.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://escrow.nfigate.com",
    siteName: "StableEscrow",
    title: "StableEscrow | Licensed & Insured Blockchain Escrow Platform",
    description: "Secure escrow transactions platform for freelancers, teams, and businesses. Licensed, regulated & insured* blockchain-powered escrow with milestone payments.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "StableEscrow - Secure Transactions. Verified Payments. Zero Trust Issues.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StableEscrow | Licensed & Insured Blockchain Escrow Platform",
    description: "Secure escrow transactions platform for freelancers, teams, and businesses. Licensed, regulated & insured* blockchain-powered escrow.",
    images: ["/og-image-twitter.svg"],
    creator: "@stableescrow",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AccessibilityProvider>
            <GoogleAuthProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </GoogleAuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
