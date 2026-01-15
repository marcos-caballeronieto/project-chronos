"use client";

import Link from "next/link";
import { Moon, Sun, Hourglass, Settings, Monitor, Type, Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(2);
  const fontSizes = ["prose-sm", "prose-base", "prose-lg", "prose-xl", "prose-2xl"];
  const fontLabels = ["XS", "S", "M", "L", "XL"];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cargar tamaño de fuente guardado
    const saved = localStorage.getItem('fontSizeLevel');
    if (saved) setFontSizeLevel(parseInt(saved));
  }, []);

  // Cierra el menú si haces clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Funciones para cambiar tamaño de fuente
  const increaseFont = () => {
    const newLevel = Math.min(fontSizeLevel + 1, fontSizes.length - 1);
    setFontSizeLevel(newLevel);
    localStorage.setItem('fontSizeLevel', newLevel.toString());
    window.dispatchEvent(new CustomEvent('fontSizeChanged', { detail: newLevel }));
  };
  
  const decreaseFont = () => {
    const newLevel = Math.max(fontSizeLevel - 1, 0);
    setFontSizeLevel(newLevel);
    localStorage.setItem('fontSizeLevel', newLevel.toString());
    window.dispatchEvent(new CustomEvent('fontSizeChanged', { detail: newLevel }));
  };

  // Prevenimos renderizado incorrecto en el servidor (Hydration Mismatch)
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Botón para ir a la página inicial */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200 dark:hover:text-stone-100 dark:hover:bg-stone-700 transition-all duration-200 flex items-center gap-2"
            title="Ir al inicio"
            aria-label="Ir al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V10" /></svg>
            <span className="hidden sm:inline font-medium">Inicio</span>
          </Link>
          {/* LOGO E IDENTIDAD */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <Hourglass size={18} className="text-amber-600 dark:text-amber-500" />
            </div>
            <span className="font-bold text-stone-800 dark:text-stone-100 tracking-tight hidden sm:block">
              Project Chronos
            </span>
          </Link>
        </div>

        {/* MENÚ DE AJUSTES (Dropdown) */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md transition-all duration-200 ${
                isOpen 
                  ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" 
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800"
              }`}
              aria-label="Ajustes de apariencia"
            >
              <Settings size={20} />
            </button>

            {/* CONTENIDO DEL DROPDOWN */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-950 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                
                {/* Cabecera del menú */}
                <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-900 mb-1 bg-stone-50/50 dark:bg-stone-900/50">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Configuración
                  </p>
                </div>

                {/* Opción: Cambiar Tema */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Monitor size={16} className="text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white">
                      Apariencia
                    </span>
                  </div>
                  
                  {/* Indicador de estado actual */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-medium">
                    <span>{theme === "dark" ? "Oscuro" : "Claro"}</span>
                    {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
                  </div>
                </button>

                {/* Separador */}
                <div className="border-b border-stone-100 dark:border-stone-800" />

                {/* Opción: Tamaño de Fuente */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Type size={16} className="text-stone-400" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      Tamaño de letra
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={decreaseFont} 
                      disabled={fontSizeLevel === 0}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Reducir letra"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        {fontLabels.map((label, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setFontSizeLevel(index);
                              localStorage.setItem('fontSizeLevel', index.toString());
                              window.dispatchEvent(new CustomEvent('fontSizeChanged', { detail: index }));
                            }}
                            className={`flex-1 py-1 px-1.5 text-xs font-medium rounded transition-all ${
                              fontSizeLevel === index
                                ? "bg-amber-600 text-white"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                            }`}
                            title={`Tamaño ${label}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={increaseFont} 
                      disabled={fontSizeLevel === fontSizes.length - 1}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aumentar letra"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Aquí podrías añadir más opciones futuras, como el switch del "Modo Zen" */}
              
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}