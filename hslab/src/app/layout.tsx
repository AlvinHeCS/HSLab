import "~/styles/globals.css";

import { type Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Bubbyverse",
  description: "Alvin & Vivian 💕",
};

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="bg-cream text-ink min-h-screen font-sans">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
