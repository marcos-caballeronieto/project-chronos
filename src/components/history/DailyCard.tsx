"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HistoryEvent, GlossaryTerm } from "@/types";
import { Lightbulb, Maximize2, X } from "lucide-react";
import { GlossaryWord } from "./GlossaryWord";
import ShareButton from "@/components/common/ShareButton";
import BookRecommendation from "@/components/common/BookRecommendation";

// --- CONSTANTES Y UTILIDADES PARA EL TIMELINE ---

const ERAS = [
  { name: "Prehistoria", short: "PRE", start: -100000, end: -3000 },
  { name: "Antigüedad", short: "ANT", start: -3000, end: 476 },
  { name: "Edad Media", short: "MED", start: 476, end: 1492 },
  { name: "Edad Moderna", short: "MOD", start: 1492, end: 1789 },
  { name: "Contemporánea", short: "CONT", start: 1789, end: new Date().getFullYear() }
];

// Función auxiliar para extraer el año del string de fecha
function parseYear(dateStr: string): number {
  const normalize = dateStr.toLowerCase();
  const match = normalize.match(/(\d{1,4})\s*(?:a\.?c\.?|b\.?c\.?|antes de cristo)?/);
  
  if (!match) return new Date().getFullYear();

  let year = parseInt(match[1], 10);
  if (normalize.includes("a.c") || normalize.includes("bc") || normalize.includes("antes")) {
    year = -year;
  }
  return year;
}

// --- SUBCOMPONENTE TIMELINE ---
function Timeline({ dateStr }: { dateStr: string }) {
  const year = parseYear(dateStr);
  const currentEraIndex = ERAS.findIndex(e => year < e.end) !== -1 
    ? ERAS.findIndex(e => year < e.end) 
    : ERAS.length - 1;
  
  const currentEra = ERAS[currentEraIndex];
  
  const eraSpan = currentEra.end - currentEra.start;
  const yearProgress = Math.max(0, Math.min(100, ((year - currentEra.start) / eraSpan) * 100));

  return (
    <div className="w-full mb-6 font-mono text-[10px] uppercase tracking-wider select-none">
      <div className="flex w-full h-2 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/50">
        {ERAS.map((era, index) => {
          const isActive = index === currentEraIndex;
          return (
            <div 
              key={era.name} 
              className={`relative flex-1 border-r border-stone-100 dark:border-stone-900 last:border-0 transition-colors duration-500 ${
                isActive ? "bg-amber-100 dark:bg-amber-900/30" : ""
              }`}
            >
              {isActive && (
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-amber-600 rounded-full shadow-[0_0_8px_rgba(217,119,6,0.8)] z-10"
                  style={{ left: `${yearProgress}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-2 text-stone-400 dark:text-stone-600">
        {ERAS.map((era, index) => (
          <div 
            key={era.name} 
            className={`flex-1 text-center transition-colors duration-300 flex flex-col items-center justify-center ${
              index === currentEraIndex 
                ? "text-amber-700 dark:text-amber-500 font-bold scale-105" 
                : "opacity-50 scale-95"
            }`}
          >
            <span className="hidden sm:inline text-[10px] md:text-xs">{era.name}</span>
            <span className="sm:hidden text-[9px] tracking-tighter leading-none">{era.short}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE MODAL ---
function ExpandedModal({ event, onClose }: { event: HistoryEvent; onClose: (e: React.MouseEvent) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
      <button 
        className="absolute top-4 right-4 md:top-8 md:right-8 text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 transition-all p-2 rounded-full z-[110] cursor-pointer"
        onClick={onClose}
        title="Cerrar (Esc)"
      >
        <X size={32} />
      </button>

      <div 
        className={`relative w-full h-full max-w-6xl max-h-[85vh] flex flex-col items-center justify-center transition-all duration-500 ease-out transform ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
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

        <div className="mt-4 flex justify-center pointer-events-none w-full">
          <div className="bg-blanco-roto/90 dark:bg-black/70 backdrop-blur-md border border-stone-200 dark:border-white/10 px-6 py-3 rounded-full shadow-lg text-center max-w-[90%]">
            <p className="text-stone-800 dark:text-stone-200 text-xs md:text-sm font-mono tracking-widest uppercase">
              <span className="text-amber-600 dark:text-amber-500 font-bold mr-2">{event.title}</span>
              <span className="opacity-60 border-l border-stone-400 dark:border-white/20 pl-2 ml-1">
                {event.imageCredit}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UTILIDAD PARA PROCESAR EL GLOSARIO ---
const renderTextWithGlossary = (text: string, glossary?: GlossaryTerm[]) => {
  if (!glossary || glossary.length === 0) return text;

  // Ordenamos términos por longitud (descendente) para evitar conflictos parciales
  const sortedGlossary = [...glossary].sort((a, b) => b.term.length - a.term.length);
  
  // Creamos Regex para encontrar los términos exactos
  const regexPattern = new RegExp(`(${sortedGlossary.map(g => g.term).join('|')})`, 'gi');
  const parts = text.split(regexPattern);

  return parts.map((part, index) => {
    // Verificamos si la parte actual coincide con algún término del glosario
    const glossaryItem = sortedGlossary.find(g => g.term.toLowerCase() === part.toLowerCase());

    if (glossaryItem) {
      return (
        <GlossaryWord 
          key={index} 
          term={part} // Mantenemos mayúsculas/minúsculas originales del texto
          definition={glossaryItem.definition} 
        />
      );
    }
    return part;
  });
};

// --- COMPONENTE PRINCIPAL ---
export default function DailyCard({ event }: { event: HistoryEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  // Construimos el texto que se compartirá
  const shareTitle = event.title;
  // Nuevo formato: Título + ¿Sabías qué? + Dato
  const shareText = `${event.title}. ¿Sabías qué? ${event.funFact}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <article 
        // CAMBIO APLICADO: overflow-visible para permitir que el glosario sobresalga
        className={`group max-w-2xl mx-auto bg-transparent shadow-xl rounded-2xl overflow-visible my-8 
        transition-all duration-1000 ease-out transform 
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* IMAGEN DE CABECERA (Altura ajustada a 500px en escritorio) */}
        {/* CAMBIO APLICADO: rounded-t-2xl para redondear la imagen manualmente */}
        <div 
          className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-t-2xl cursor-pointer" 
          onClick={handleOpen}
        >
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0"
              style={{ objectPosition: event.imagePosition || "center" }}
              priority
            />
            {/* Gradiente para mejorar legibilidad en transición */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <button
            onClick={handleOpen}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-amber-600 text-white rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30 cursor-pointer shadow-lg hover:scale-110"
            title="Ver imagen completa"
            type="button"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* CONTENIDO (Con margen negativo aumentado a -mt-16) */}
        <div className="relative z-10 -mt-16 bg-blanco-roto dark:bg-stone-900 rounded-t-3xl p-6 md:p-10 border-x border-b border-stone-100 dark:border-stone-800 rounded-b-2xl">
           
           <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-white uppercase bg-amber-600 rounded-full shadow-sm w-fit">
              {event.category}
            </span>
            <p className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              {event.date} • {event.imageCredit}
            </p>
          </div>

          <Timeline dateStr={event.date} />

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6 mt-2">
            {event.title}
          </h1>
          
          <div className="bg-stone-50 dark:bg-stone-800/50 border-l-4 border-amber-600 p-4 mb-8 italic text-stone-700 dark:text-stone-300 rounded-xl">
            <span className="flex items-center gap-2 font-bold not-italic mb-1 text-amber-800 dark:text-amber-500">
              <Lightbulb size={18} /> ¿Sabías que...?
            </span>
            {/* Renderizado con glosario en Fun Fact */}
            {renderTextWithGlossary(event.funFact, event.glossary)}
          </div>
          
          <div className="prose prose-stone dark:prose-invert prose-lg max-w-none text-stone-700 dark:text-stone-300">
            {event.story.split('\n').map((paragraph, i) => (
              <p 
                key={i} 
                className={
                  i === 0 
                    ? "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-600 first-letter:float-left first-letter:mr-1 first-letter:leading-none first-letter:mt-[-15]" 
                    : ""
                }
              >
                {/* Renderizado con glosario en la historia */}
                {renderTextWithGlossary(paragraph, event.glossary)}
              </p>
            ))}
          </div>
          
          {event.tags && event.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={shareUrl}
                className="hover:bg-stone-100 dark:hover:bg-stone-800 p-1.5 h-8 w-8 rounded-md transition-colors"
              />
            </div>
          )}

          {/* Recomendación de libro afiliado - Por implementar */}
          {/* 
            TODO: Reemplazar el amazonLink con tu enlace de afiliado de Amazon cuando esté activo
            Formato esperado: "https://amzn.to/TU_CODIGO" o tu enlace de Amazon Associates
            Para cambiar el libro, actualiza:
            - bookImage: URL de la portada del libro en Amazon
            - bookTitle: Título del libro
            - amazonLink: Tu enlace de afiliado
          */}
          {/* <BookRecommendation 
            bookImage="https://m.media-amazon.com/images/I/51X5pQX8AEL._SY445_SX342_.jpg"
            bookTitle="Sapiens: De animales a dioses"
            amazonLink="https://a.co/d/1fzR4Rk" // Reemplazar con tu enlace de afiliado
          /> */}
        </div>
      </article>

      {isExpanded && <ExpandedModal event={event} onClose={handleClose} />}
    </>
  );
}