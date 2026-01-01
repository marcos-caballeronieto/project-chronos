"use client";
import Link from "next/link";
import { Moon, Sun, Hourglass, Settings, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

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

  // Prevenimos renderizado incorrecto en el servidor
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-amber-600 p-1.5 rounded-lg text-white group-hover:bg-amber-700 transition-colors">
            <Hourglass size={20} />
          </div>
          <span className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            Chronos
          </span>
        </Link>

        {/* Botón de Configuración y Menú Desplegable */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isOpen 
                ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rotate-90" 
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
            aria-label="Abrir configuración"
          >
            <Settings size={20} />
          </button>

          {/* El Menú Flotante */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-950 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-900 mb-1">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Visualización</p>
              </div>

              {/* Opción: Cambiar Tema */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
              >
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500">
                  Apariencia
                </span>
                <div className="flex items-center gap-2 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-500">
                  <span className="text-xs">{theme === "dark" ? "Oscuro" : "Claro"}</span>
                  {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                </div>
              </button>

              {/* Aquí irán tus futuras opciones (Zen Mode, Fuente, etc.) */}
              {/* <button className="...">
                 Modo Zen
              </button> 
              */}
              
            </div>
          )}
        </div>
      </div>
    </header>
  );
}