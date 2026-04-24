import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "AI Content Engine",
  description:
    "Generate, plan, and track your social media content with multi-step AI workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
      <Analytics />
    </html>
  );
}
