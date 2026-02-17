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
  title: "Escrow System",
  description: "Secure escrow transactions platform",
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
