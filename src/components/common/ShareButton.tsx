"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Link as LinkIcon, Twitter, MessageCircle } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = "Project Chronos",
  text = "Descubre la historia.",
  url,
  className = "",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Obtenemos la URL del navegador si no se pasa como prop
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  // Texto completo para WhatsApp
  const fullText = `${text} ${shareUrl}`;

  // Cerrar menú si clicamos fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMainClick = () => {
    // 1. DETECCIÓN DE MÓVIL:
    // Solo usamos el menú nativo (navigator.share) si estamos realmente en un móvil (Android/iPhone).
    // Esto evita que en PC se intente abrir un menú nativo que a veces no funciona bien o es invisible.
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobileDevice && navigator.share) {
      navigator.share({
        title,
        text,
        url: shareUrl,
      }).catch((err) => console.log("Compartir cancelado", err));
    } else {
      // 2. EN PC / DESKTOP:
      // Abrimos siempre nuestro menú personalizado con iconos
      setIsOpen(!isOpen);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  // Configuración de redes sociales
  const socialLinks = [
    {
      name: "X / Twitter",
      icon: <Twitter size={16} />,
      // Usamos intent de Twitter
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-black dark:hover:text-white"
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle size={16} />,
      // Usamos api de WhatsApp
      href: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
      color: "hover:text-green-500"
    },
    {
      name: "Reddit",
      icon: <span className="font-bold text-xs">R</span>,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: "hover:text-orange-500"
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleMainClick}
        className={`relative inline-flex items-center justify-center rounded-md p-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 
          ${isOpen ? "bg-stone-200 dark:bg-stone-700 text-amber-600 scale-110" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-amber-600"} 
          ${className}`}
        aria-label="Compartir"
        title="Compartir"
        type="button"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {/* MENÚ DESPLEGABLE (Visible solo cuando isOpen es true) */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 z-50">
          <div className="p-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold text-center">
              Compartir en
            </p>
          </div>
          
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${social.color}`}
              onClick={() => setIsOpen(false)}
            >
              {social.icon}
              <span className="font-medium">{social.name}</span>
            </a>
          ))}

          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-t border-stone-100 dark:border-stone-800 text-left w-full"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
            <span className={copied ? "text-green-600 font-bold" : ""}>
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}