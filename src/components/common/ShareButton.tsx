"use client";

import { useState } from "react";
import { Share2, Check, Link as LinkIcon, AlertCircle } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = "Project Chronos",
  text = "Descubre la historia, un día a la vez.",
  url,
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  // Función auxiliar para copiar texto de forma segura (Fallback legacy)
  const copyToClipboard = async (textToCopy: string) => {
    try {
      // 1. Intento moderno
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      } else {
        throw new Error("Clipboard API no disponible");
      }
    } catch (err) {
      // 2. Fallback antiguo (funciona en HTTP y navegadores viejos)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        
        // Aseguramos que el textarea no sea visible pero sea parte del DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (legacyErr) {
        console.error("Fallo total al copiar", legacyErr);
        return false;
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareData = { title, text, url: shareUrl };

    // Reiniciar estados
    setError(false);
    setCopied(false);

    // 1. Intentar API Nativa (Móviles)
    // Verificamos si existe share y si podemos compartir esos datos
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        // Si se comparte con éxito, no hacemos nada más (o podrías mostrar un check)
      } catch (err) {
        // Si el usuario cancela, no es un error real.
        if ((err as Error).name !== "AbortError") {
          console.error("Error al compartir:", err);
          // Si falla la nativa (no por cancelar), intentamos copiar el texto completo
          triggerCopy(`${title}\n\n${text}\n\n${shareUrl}`);
        }
      }
    } else {
      // 2. Si no hay soporte nativo (PC o HTTP), copiamos el texto completo al portapapeles
      triggerCopy(`${title}\n\n${text}\n\n${shareUrl}`);
    }
  };

  const triggerCopy = async (textToCopy: string) => {
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`relative inline-flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
        error 
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      } ${className}`}
      aria-label="Compartir"
      title="Compartir esta página"
    >
      <div className="relative">
        <Share2
          className={`h-5 w-5 transition-all duration-300 ${
            copied || error ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        
        {/* Icono de Éxito */}
        <Check
          className={`absolute inset-0 h-5 w-5 text-green-500 transition-all duration-300 ${
            copied ? "scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />

        {/* Icono de Error (Visual feedback si falla todo) */}
        <AlertCircle
          className={`absolute inset-0 h-5 w-5 text-red-500 transition-all duration-300 ${
            error ? "scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      
      {/* Toast flotante */}
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs font-medium text-white shadow-md animate-in fade-in slide-in-from-top-1 z-50">
          ¡Texto copiado!
        </span>
      )}
    </button>
  );
}