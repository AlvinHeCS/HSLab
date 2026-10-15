import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Nav } from "~/app/_components/nav";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Bubbyverse",
  description: "Alvin & Vivian 💕",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-[#f9e2e1] text-[#5b4636]">
        <TRPCReactProvider>
          <Nav />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
