import Image from "next/image";
import { HistoryEvent } from "@/types";
import { Lightbulb } from "lucide-react";

export default function DailyCard({ event }: { event: HistoryEvent }) {
  return (
    <article className="group max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-xl rounded-2xl overflow-hidden my-8 border border-stone-100 dark:border-stone-800 transition-colors duration-300">
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 z-10">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-white uppercase bg-amber-600 rounded-full shadow-sm">
            {event.category}
          </span>
          <p className="text-white text-sm opacity-95 font-medium shadow-black/50 drop-shadow-md">
            {event.date} • {event.imageCredit}
          </p>
        </div>
      </div>
      <div className="p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6">
          {event.title}
        </h1>
        <div className="bg-stone-50 dark:bg-stone-800/50 border-l-4 border-amber-600 p-4 mb-8 italic text-stone-700 dark:text-stone-300 rounded-xl">
          <span className="flex items-center gap-2 font-bold not-italic block mb-1 text-amber-800 dark:text-amber-500">
            <Lightbulb size={18} /> ¿Sabías que...?
          </span>
          {event.funFact}
      </div>
        <div className="prose prose-stone dark:prose-invert prose-lg max-w-none text-stone-700 dark:text-stone-300">
          {event.story.split('\n').map((p, i) => (
            <p 
              key={i} 
              className={
                i === 0 
                  ? "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-600 first-letter:float-left first-letter:mr-1 first-letter:leading-none first-letter:mt-[-15]" 
                  : ""
              }
            >
              {p}
            </p>
          ))}
        </div>
        {event.tags && event.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex gap-2 flex-wrap">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}