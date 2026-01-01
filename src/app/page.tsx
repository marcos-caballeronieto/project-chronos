import DailyCard from "@/components/history/DailyCard";
import { HistoryEvent } from "@/types";

const dummyEvent: HistoryEvent = {
  id: "1", date: "1969-07-20", year: 1969,
  title: "El gran salto de la humanidad",
  description: "Apolo 11 llega a la Luna.",
  category: "Ciencia",
  imageUrl: "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1000&auto=format&fit=crop",
  imageCredit: "NASA",
  funFact: "La computadora del Apolo tenía menos potencia que un reloj digital.",
  story: "Neil Armstrong descendió lentamente...\n\nEs un pequeño paso para el hombre...",
  tags: ["Espacio", "Guerra Fría"]
};

export default function Home() {
  return <DailyCard event={dummyEvent} />;
}