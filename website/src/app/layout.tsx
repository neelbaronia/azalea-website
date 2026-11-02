import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, EB_Garamond } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://www.azalea-labs.com"),
  title: "Azalea Labs",
  description: "The world's largest audio library.",
  icons: {
    icon: AUDIO_APP_ICON,
    apple: AUDIO_APP_ICON,
  },
  openGraph: {
    title: "Azalea Labs",
    description: "The world's largest audio library.",
    images: [{ url: AUDIO_APP_ICON }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${garamond.variable} antialiased flex min-h-screen flex-col`}
      >
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
