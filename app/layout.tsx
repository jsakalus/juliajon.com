import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Nunito, Caveat } from "next/font/google";
import NavBar from "./components/NavBar";
import FlowerBorders from "./components/FlowerBorders";
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
  metadataBase: new URL("https://juliajon.com"),
  title: "Julia & Jonathan | May 29, 2027",
  description: "Julia & Jonathan's wedding — May 29, 2027 in Canmore, Alberta",
  openGraph: {
    title: "Julia & Jonathan | May 29, 2027",
    description: "Julia & Jonathan's wedding — May 29, 2027 in Canmore, Alberta",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable} ${caveat.variable}`}>
      <head>
        <link rel="preload" as="image" href="/peanut/peanut-celebrate.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-beige text-brown font-sans">

        {!isAdmin && <FlowerBorders />}
        {!isAdmin && <NavBar />}

        <main className="flex-1">
          {children}
        </main>

        {!isAdmin && (
          <footer className="bg-brown px-8 py-10 text-center relative z-10">
            <p className="font-serif italic text-beige text-xl mb-2">Julia & Jonathan</p>
            <p className="text-beige/60 text-sm tracking-widest uppercase font-sans">May 29, 2027 · Canmore, Alberta</p>
          </footer>
        )}

      </body>
    </html>
  );
}
