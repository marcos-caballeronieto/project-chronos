import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-merriweather" });

// 1. AÑADE ESTO: Define la URL base de tu web (en producción pon tu dominio real)
// Si estás en local, usa localhost, pero para probar las imágenes en WhatsApp necesitas un dominio público (o usar ngrok).
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : "http://localhost:3000";

export const metadata: Metadata = { 
  metadataBase: new URL(baseUrl),
  title: {
    default: "Chronos - Historia Diaria",
    template: "%s | Chronos"
  },
  description: "Descubre los eventos que marcaron la historia, día a día.",
  // Configuración para WhatsApp, Facebook, LinkedIn, etc.
  openGraph: {
    title: "Chronos - Historia Diaria",
    description: "Descubre los eventos que marcaron la historia.",
    url: baseUrl,
    siteName: "Chronos",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Asegúrate de tener esta imagen en public/
        width: 1200,
        height: 630,
        alt: "Chronos - Historia Diaria",
      },
    ],
  },
  // Configuración para Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Chronos - Historia Diaria",
    description: "Descubre los eventos que marcaron la historia.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} antialiased bg-blanco-roto dark:bg-stone-950 flex min-h-screen flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="min-h-screen p-4">{children}</main>
          <Footer />
          
          <div className="bg-noise mix-blend-overlay dark:mix-blend-soft-light"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
