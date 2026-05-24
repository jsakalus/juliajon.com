import type { Metadata } from "next";
import { Playfair_Display, Nunito, Caveat } from "next/font/google";
import NavBar from "./components/NavBar";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Julia & Jonathan | May 29, 2027",
  description: "Julia & Jonathan's wedding — May 29, 2027 in Canmore, Alberta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable} ${caveat.variable}`}>
      <head>
        <link rel="preload" as="image" href="/peanut-celebrate.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-beige text-brown font-sans">

        <NavBar />

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-brown px-8 py-10 text-center">
          <p className="font-serif italic text-beige text-xl mb-2">Julia & Jonathan</p>
          <p className="text-beige/60 text-sm tracking-widest uppercase font-sans">May 29, 2027 · Canmore, Alberta</p>
        </footer>

      </body>
    </html>
  );
}
