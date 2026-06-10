import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchCategories } from "@/lib/api";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "RetailForge — Shop Outdoor, Apparel, Home & More",
  description: "A premium department-store experience powered by a multi-agent retail concierge.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let categories: string[] = [];
  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-white text-ink antialiased">
        <Providers>
          <TopBar />
          <Header categories={categories} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer categories={categories} />
        </Providers>
      </body>
    </html>
  );
}
