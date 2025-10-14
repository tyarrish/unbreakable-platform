import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Rogue Leadership Training Experience",
  description: "Lead from Within. Grow with Others. Impact Your Community.",
  keywords: ["leadership", "training", "community", "development", "rogue leadership"],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "Rogue Leadership Training Experience",
    description: "Lead from Within. Grow with Others. Impact Your Community.",
    type: "website",
    images: ['/RLTE-logo.png'],
  },
  twitter: {
    card: "summary",
    title: "Rogue Leadership Training Experience",
    description: "Lead from Within. Grow with Others. Impact Your Community.",
    images: ['/RLTE-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
