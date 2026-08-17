import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Question Paper Tracker 2026-27",
  description: "Track question papers, blueprints, marking schemes and print workflow for school examinations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
