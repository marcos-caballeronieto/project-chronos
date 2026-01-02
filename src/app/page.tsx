// src/app/page.tsx
import DailyCard from "@/components/history/DailyCard";
import { HistoryEvent } from "@/types";

const dummyEvent: HistoryEvent = {
  id: "1", 
  date: "1969-07-20", 
  year: 1969,
  title: "El gran salto de la humanidad",
  description: "Apolo 11 llega a la Luna.",
  category: "Ciencia",
  imageUrl: "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1000&auto=format&fit=crop",
  imageCredit: "NASA",
  imagePosition: "0% 30%",
  
  // Dato curioso: aquí probaremos si detecta "Apolo" y "reloj digital"
  funFact: "La computadora del Apolo tenía menos potencia que un reloj digital actual.",
  
  // Historia: aquí probaremos si detecta "Neil Armstrong"
  story: `Neil Armstrong descendió lentamente por la escalerilla del módulo lunar. Al pisar la superficie polvorienta, pronunció la frase que pasaría a la historia.
  
Es un pequeño paso para el hombre, pero un gran salto para la humanidad.`,
  
  tags: ["Espacio", "Guerra Fría"],

  // --- NUEVA SECCIÓN: GLOSARIO ---
  glossary: [
    {
      term: "Apolo",
      definition: "Programa espacial de la NASA (1961-1972) que logró llevar al ser humano a la Luna. La misión Apolo 11 fue la primera en aterrizar con éxito."
    },
    {
      term: "Neil Armstrong",
      definition: "(1930-2012) Astronauta estadounidense, ingeniero aeronáutico y el primer ser humano en caminar sobre la Luna."
    },
    {
      term: "reloj digital",
      definition: "Como referencia, el Apollo Guidance Computer (AGC) tenía solo 2KB de RAM y 36KB de ROM. Un reloj inteligente moderno es millones de veces más potente."
    }
  ]
};

export default function Home() {
  return (
    <main className="min-h-screen bg-blanco-roto dark:bg-stone-950 py-12 px-4">
      <DailyCard event={dummyEvent} />
    </main>
  );
}