"use client";
import { useState } from "react";

interface GlossaryWordProps {
  term: string;        
  definition: string;  
}

export const GlossaryWord = ({ term, definition }: GlossaryWordProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation(); 
        setIsOpen(!isOpen);
      }}
    >
      {/* Palabra subrayada / interactiva */}
      <span className="cursor-help border-b-2 border-dotted border-amber-500 text-stone-900 dark:text-stone-100 font-semibold transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded px-0.5">
        {term}
      </span>

      {/* Tooltip */}
      <span
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 
        bg-blanco-roto/95 dark:bg-stone-900/95 
        text-stone-800 dark:text-stone-100 
        text-sm rounded-xl shadow-xl backdrop-blur-sm
        z-50 transition-all duration-200 pointer-events-none origin-bottom
        border border-stone-200 dark:border-stone-700
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"}`}
      >
        <span className="block font-serif font-bold text-amber-600 dark:text-amber-500 text-base mb-1 border-b border-stone-200 dark:border-stone-700 pb-1">
          {term}
        </span>
        {definition}
      </span>
    </span>
  );
};