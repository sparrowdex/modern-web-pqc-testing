import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MovingTitle from "@/components/MovingTitle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RSA vs ML-KEM Benchmark",
  description: "Comparative Study of Classical Cryptography (RSA) and Quantum Cryptography (ML-KEM) Applied in Modern Web Applications",
  icons: {
    icon: "/lattice-logo.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MovingTitle />
        {children}
      </body>
    </html>
  );
}
