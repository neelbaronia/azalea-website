import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, EB_Garamond } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./posthog-provider";

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
  title: "Azalea Labs",
  description: "The world's largest audio library.",
  icons: {
    icon: "/azalea-icon.png",
    apple: "/azalea-icon.png",
  },
  openGraph: {
    title: "Azalea Labs",
    description: "The world's largest audio library.",
    images: [{ url: "/azalea-icon.png" }],
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
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${garamond.variable} antialiased`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
