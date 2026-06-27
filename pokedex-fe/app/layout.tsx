import type { Metadata } from "next";

import "./globals.css";

// Application metadata configurations for SEO and browser title
export const metadata: Metadata = {
  title: "Pokedex",
  description: "Pokedex built with Next.js, FastAPI, and MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set document language to English
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
