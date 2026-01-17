// src/app/page.tsx
import DailyCard from "@/components/history/DailyCard";
import { HistoryEvent } from "@/types";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

// Lógica de Selección del Evento
async function getDailyEvent(): Promise<HistoryEvent | null> {
  const now = new Date();
  
  // Definimos el rango de "Hoy" (desde las 00:00 hasta las 23:59)
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  // 1. ¿Ya tenemos un evento seleccionado para hoy?
  const eventToday = await prisma.event.findFirst({
    where: {
      lastShownAt: {
        gte: startOfDay, // Mayor o igual al inicio del día
        lte: endOfDay,   // Menor o igual al final del día
      },
    },
    include: { tags: true, glossary: true },
  });

  if (eventToday) {
    return mapEventData(eventToday);
  }

  // 2. Si no hay evento de hoy, buscamos uno NUEVO (que nunca se haya mostrado)
  // Opcional: Podrías añadir un filtro aquí para buscar efemérides que coincidan con la fecha actual
  let nextEvent = await prisma.event.findFirst({
    where: {
      lastShownAt: null, // Nunca usado
    },
    include: { tags: true, glossary: true },
  });

  // 3. Si se acabaron los eventos nuevos, RECICLAMOS el más antiguo
  if (!nextEvent) {
    nextEvent = await prisma.event.findFirst({
      orderBy: {
        lastShownAt: 'asc', // El que tiene la fecha más vieja
      },
      include: { tags: true, glossary: true },
    });
  }

  // Si aún así no hay nada (Base de datos vacía), devolvemos null
  if (!nextEvent) return null;

  // 4. Marcamos el evento elegido como "Visto hoy"
  await prisma.event.update({
    where: { id: nextEvent.id },
    data: { lastShownAt: new Date() },
  });

  return mapEventData(nextEvent);
}

// Helper para limpiar/transformar datos antes de enviarlos al frontend
function mapEventData(eventDB: any): HistoryEvent {
  return {
    ...eventDB,
    tags: eventDB.tags.map((t: any) => t.name),
    glossary: eventDB.glossary.map((g: any) => ({
      term: g.term,
      definition: g.definition,
    })),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const event = await getDailyEvent();
  if (!event) return { title: "Project Chronos" };

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      images: [{ url: event.imageUrl, alt: event.title }],
    },
  };
}

export default async function Home() {
  const event = await getDailyEvent();

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blanco-roto dark:bg-stone-950">
        <p className="text-xl text-stone-500">
          No hay eventos disponibles en la base de datos.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blanco-roto dark:bg-stone-950 py-12 px-4">
      <DailyCard event={event} />
    </main>
  );
}