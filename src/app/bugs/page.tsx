"use client";

import { useState } from "react";
import { Bug, Lightbulb, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

// DEFINICIÓN DE TIPOS
interface FormDataState {
  type: "bug" | "suggestion";
  title: string;
  description: string;
  email: string;
}

export default function BugsPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  
  const [formData, setFormData] = useState<FormDataState>({
    type: "bug",
    title: "",
    description: "",
    email: ""
  });

  // NO HACER ESTA FUNCIÓN ASYNC (El componente debe ser síncrono)
  // La función handleSubmit SÍ puede ser async porque es un evento.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulación de envío
    await new Promise((resolve) => setTimeout(resolve, 1500)); 
    setStatus("success");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Solución al error de TypeScript "Element implicitly has an 'any' type..."
    setFormData((prev) => ({
      ...prev,
      [name as keyof FormDataState]: value
    }));
  };

  // Manejo especial para los Radio Buttons (ya que usan onClick o onChange diferente a veces)
  const handleTypeChange = (type: "bug" | "suggestion") => {
    setFormData((prev) => ({ ...prev, type }));
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ring-8 ring-green-50 dark:ring-green-900/10">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold font-merriweather text-stone-800 dark:text-stone-100">
            ¡Mensaje recibido!
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Gracias por ayudarnos a mejorar Project Chronos. Revisaremos tu {formData.type === 'bug' ? 'reporte' : 'sugerencia'} lo antes posible.
          </p>
        </div>
        <Link 
          href="/"
          className="px-6 py-2.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      
      {/* Encabezado */}
      <div className="mb-10 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold font-merriweather text-stone-800 dark:text-stone-100 tracking-tight">
          Reportes y Sugerencias
        </h1>
        <p className="text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          ¿Encontraste un error o tienes una idea genial? Cuéntanoslo.
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Selector de Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => handleTypeChange("bug")}
              className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all relative ${
                formData.type === 'bug' 
                  ? 'bg-amber-50 border-amber-500/50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-500/50 dark:text-amber-400 ring-1 ring-amber-500/50 shadow-sm' 
                  : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="p-2 bg-white dark:bg-stone-950 rounded-full border border-stone-100 dark:border-stone-800 shadow-sm">
                <Bug size={20} />
              </div>
              <span className="font-medium">Reportar Bug</span>
            </div>

            <div 
              onClick={() => handleTypeChange("suggestion")}
              className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all relative ${
                formData.type === 'suggestion' 
                  ? 'bg-amber-50 border-amber-500/50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-500/50 dark:text-amber-400 ring-1 ring-amber-500/50 shadow-sm' 
                  : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="p-2 bg-white dark:bg-stone-950 rounded-full border border-stone-100 dark:border-stone-800 shadow-sm">
                <Lightbulb size={20} />
              </div>
              <span className="font-medium">Sugerencia</span>
            </div>
          </div>

          {/* Campo: Título */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              {formData.type === 'bug' ? 'Resumen del problema' : 'Título de tu idea'}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder={formData.type === 'bug' ? "Ej: El botón no funciona..." : "Ej: Modo oscuro automático..."}
              className="w-full px-4 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-stone-400"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Campo: Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Descripción detallada
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="Explica los detalles..."
              className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-stone-400"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Campo: Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              Tu Email <span className="text-xs font-normal text-stone-400">Opcional</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="nombre@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-stone-400"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-md hover:shadow-lg transform active:scale-[0.98]"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar Mensaje
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}