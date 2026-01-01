import Image from "next/image";
import { HistoryEvent } from "@/types";

export default function DailyCard({ event }: { event: HistoryEvent }) {
  return (
    <article className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-xl rounded-2xl overflow-hidden my-8 border border-stone-100 dark:border-stone-800 transition-colors duration-300">
      <div className="relative w-full h-64 md:h-96">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-white uppercase bg-amber-600 rounded-full">{event.category}</span>
          <p className="text-white text-sm opacity-90">{event.date} • {event.imageCredit}</p>
        </div>
      </div>
      <div className="p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6">{event.title}</h1>
        <div className="bg-stone-50 dark:bg-stone-800/50 border-l-4 border-amber-600 p-4 mb-8 italic text-stone-700 dark:text-stone-300">
          <span className="font-bold not-italic block mb-1 text-amber-800 dark:text-amber-500">¿Sabías que...?</span>
          {event.funFact}
        </div>
        <div className="prose prose-stone dark:prose-invert prose-lg max-w-none text-stone-700 dark:text-stone-300">
          {event.story.split('\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </article>
  );
}