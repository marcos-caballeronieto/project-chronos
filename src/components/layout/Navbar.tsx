"use client";

import Link from "next/link";
import { Moon, Sun, Hourglass, Settings, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import ShareButton from "@/components/common/ShareButton"; // <--- Importamos el botón nuevo

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

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

  // Prevenimos renderizado incorrecto en el servidor (Hydration Mismatch)
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        
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

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2">
          
          {/* 1. BOTÓN DE COMPARTIR (Nuevo) */}
          {/* Lo pasamos con estilos que coincidan con tu navbar (hover stone) */}
          <ShareButton 
            className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors" 
          />

          {/* 2. MENÚ DE AJUSTES (Dropdown) */}
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

                {/* Aquí podrías añadir más opciones futuras, como el switch del "Modo Zen" */}
              
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}