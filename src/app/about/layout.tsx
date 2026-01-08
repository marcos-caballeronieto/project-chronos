import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre mí | Chronos",
  description: "Conoce la historia detrás de Project Chronos y a su creador, Marcos Caballero.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}