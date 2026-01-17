// src/app/page.tsx
import DailyCard from "@/components/history/DailyCard";
import { HistoryEvent } from "@/types";
import { prisma } from "@/lib/prisma"; // 1. Importamos la conexión
import { Metadata } from "next";

// 2. Función para obtener datos de la DB
async function getDailyEvent(): Promise<HistoryEvent | null> {
  const eventDB = await prisma.event.findFirst({
    // Importante: Debemos pedir explícitamente las relaciones
    include: {
      tags: true,
      glossary: true,
    }
  });

  if (!eventDB) return null;

  // 3. Mapeo de datos: Prisma devuelve objetos, pero tu UI espera strings simples para los tags
  const mappedEvent: HistoryEvent = {
    ...eventDB,
    // Convertimos el array de objetos Tag [{id, name}, ...] a array de strings ["Espacio", ...]
    tags: eventDB.tags.map(tag => tag.name),
    // El glosario ya coincide con la estructura requerida, así que lo pasamos tal cual
    glossary: eventDB.glossary.map(g => ({
      term: g.term,
      definition: g.definition
    }))
  };

  return mappedEvent;
}

export async function generateMetadata(): Promise<Metadata> {
  const event = await getDailyEvent();
  
  if (!event) {
    return {
      title: "Project Chronos",
      description: "La historia día a día."
    };
  }

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      images: [{ url: event.imageUrl, width: 1200, height: 630, alt: event.title }],
    },
  };
}

export default async function Home() {
  // 4. Llamamos a la función asíncrona dentro del componente
  const event = await getDailyEvent();

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blanco-roto dark:bg-stone-950">
        <p className="text-xl text-stone-500">No hay eventos históricos para hoy.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blanco-roto dark:bg-stone-950 py-12 px-4">
      <DailyCard event={event} />
    </main>
  );
}