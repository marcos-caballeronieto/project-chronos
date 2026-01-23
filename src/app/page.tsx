import DailyCard from "@/components/history/DailyCard";
import { HistoryEvent } from "@/types";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { cache } from "react"; // IMPORTANTE: Para optimizar la petición interna

// ⏱️ CONFIGURACIÓN ISR:
// Esto le dice a Next.js: "Guarda esta página en caché por 3600 segundos (1 hora)".
// - Si entran 1000 usuarios en esa hora, la DB no se entera (0 consumo).
// - Pasada la hora, el primer usuario activará una regeneración silenciosa para ver si ya es "mañana".
export const revalidate = 3600; 

// Envolvemos la lógica en 'cache' para que generateMetadata y Home no hagan 2 consultas separadas en la misma visita
const getDailyEvent = cache(async (): Promise<HistoryEvent | null> => {
  const now = new Date();
  
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  // 1. ¿Ya tenemos un evento seleccionado para hoy?
  const eventToday = await prisma.event.findFirst({
    where: {
      lastShownAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { tags: true, glossary: true },
  });

  if (eventToday) {
    return mapEventData(eventToday);
  }

  // 2. Si no, buscamos uno NUEVO
  let nextEvent = await prisma.event.findFirst({
    where: {
      lastShownAt: null, 
    },
    include: { tags: true, glossary: true },
  });

  // 3. Si no hay nuevos, RECICLAMOS el más antiguo
  if (!nextEvent) {
    nextEvent = await prisma.event.findFirst({
      orderBy: {
        lastShownAt: 'asc', 
      },
      include: { tags: true, glossary: true },
    });
  }

  if (!nextEvent) return null;

  // 4. Marcamos el evento elegido
  await prisma.event.update({
    where: { id: nextEvent.id },
    data: { lastShownAt: new Date() },
  });

  return mapEventData(nextEvent);
});

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