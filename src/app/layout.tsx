import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LTE Cruise AIS — Sistem Informasi Akademik",
  description:
    "Sistem Informasi Akademik LTE Cruise — Leading Tourism Education. Sekolah Perhotelan & Kapal Pesiar di Kampung Inggris, Pare, Kediri.",
  keywords: [
    "LTE Cruise",
    "sistem informasi akademik",
    "perhotelan",
    "kapal pesiar",
    "Pare",
    "Kediri",
    "Kampung Inggris",
  ],
  authors: [{ name: "LTE Cruise" }],
  openGraph: {
    title: "LTE Cruise AIS",
    description: "Your Gateway to Hotel & Cruise Career",
    siteName: "LTE Cruise AIS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistMono.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
