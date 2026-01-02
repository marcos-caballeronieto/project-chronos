"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HistoryEvent } from "@/types";
import { Lightbulb, Maximize2, X } from "lucide-react";

// --- Subcomponente para el Modal con Animación ---
function ExpandedModal({ event, onClose }: { event: HistoryEvent; onClose: (e: React.MouseEvent) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Activamos la animación un frame después del montaje para que la transición CSS funcione
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-blanco-roto/95 dark:bg-stone-900/95 backdrop-blur-lg p-4 md:p-8 transition-opacity duration-500 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* Botón Cerrar */}
      <button 
        className="absolute top-4 right-4 md:top-8 md:right-8 text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 transition-all p-2 rounded-full z-[110] cursor-pointer"
        onClick={onClose}
        title="Cerrar (Esc)"
      >
        <X size={32} />
      </button>

      {/* Contenedor Visual con animación de escala y movimiento */}
      <div 
        className={`relative w-full h-full max-w-6xl max-h-[85vh] flex flex-col items-center justify-center transition-all duration-500 ease-out transform ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Imagen */}
        <div className="relative w-full flex-1 shadow-2xl shadow-black rounded-sm overflow-hidden border border-stone-200 dark:border-stone-800/50 bg-black">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-contain"
            priority
            quality={100}
          />
        </div>

        {/* Pie de foto */}
        <div className="mt-4 flex justify-center pointer-events-none w-full">
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-stone-200 dark:border-white/10 px-6 py-3 rounded-full shadow-lg text-center max-w-[90%]">
            <p className="text-stone-800 dark:text-stone-200 text-sm md:text-base font-serif tracking-wide">
              <span className="text-amber-600 dark:text-amber-500 font-bold mr-2">{event.title}</span>
              <span className="opacity-60 text-xs uppercase tracking-widest border-l border-stone-400 dark:border-white/20 pl-2 ml-1">
                {event.imageCredit}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function DailyCard({ event }: { event: HistoryEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <>
      <article className="group max-w-2xl mx-auto bg-blanco-roto dark:bg-stone-900 shadow-xl rounded-2xl overflow-hidden my-8 border border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          {/* Contenedor de la imagen */}
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0"
              style={{ objectPosition: event.imagePosition || "center" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Botón de ampliar */}
          <button
            onClick={handleOpen}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-amber-600 text-white rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30 cursor-pointer shadow-lg hover:scale-110"
            title="Ver imagen completa"
            type="button"
          >
            <Maximize2 size={20} />
          </button>

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
            <span className="flex items-center gap-2 font-bold not-italic mb-1 text-amber-800 dark:text-amber-500">
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
                    ? "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-600 first-letter:float-left first-letter:mr-1 first-letter:leading-none first-letter:mt-[-15px]"
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

      {/* Renderizado condicional del Modal */}
      {isExpanded && <ExpandedModal event={event} onClose={handleClose} />}
    </>
  );
}