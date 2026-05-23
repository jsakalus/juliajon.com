import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col bg-beige text-brown font-sans">

        <nav className="bg-sage px-8 py-3 flex items-center justify-between">
          <Link href="/" aria-label="Home">
            <Image
              src="/dog.png"
              alt="Peanut"
              width={44}
              height={44}
              className="rounded-full object-cover border-2 border-white/50 hover:border-white transition-colors"
            />
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/90 font-sans">
            <Link href="/schedule" className="hover:text-white transition-colors">Schedule</Link>
            <Link href="/travel" className="hover:text-white transition-colors">Travel</Link>
            <Link href="/where-to-stay" className="hover:text-white transition-colors">Where to Stay</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/registry" className="hover:text-white transition-colors">Registry</Link>
            <Link href="/rsvp" className="bg-white text-sage px-5 py-1.5 font-semibold tracking-wide hover:bg-beige transition-colors rounded-sm">
              RSVP
            </Link>
          </div>
        </nav>

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
