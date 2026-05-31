import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Pokedex com Next.js, FastAPI e MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
