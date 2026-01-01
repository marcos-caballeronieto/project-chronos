import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-merriweather" });

export const metadata: Metadata = { title: "Chronos", description: "Historia Diaria" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} antialiased bg-stone-50 dark:bg-stone-950`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="min-h-screen p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
