import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SamBert - Budget Tracker",
  description: "A simple budget tracker for couples",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SamBert",
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: "SamBert",
    title: "SamBert - Budget Tracker",
    description: "A simple budget tracker for couples"
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#93E5AB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          {children}
        </div>
      </body>
    </html>
  );
}