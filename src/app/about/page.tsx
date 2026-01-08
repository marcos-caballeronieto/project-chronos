import Link from "next/link";
import { Github, Twitter, Coffee, Code2, Heart, Hourglass } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-16">
      
      {/* --- SECCIÓN 1: INTRODUCCIÓN --- */}
      <section className="text-center space-y-6">
        <div className="inline-flex p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-500 mb-2">
          <Hourglass size={32} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-merriweather text-stone-900 dark:text-stone-50 tracking-tight">
          Más que fechas, <br />
          <span className="text-amber-600 dark:text-amber-500">historias humanas.</span>
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Project Chronos nació de una idea simple: la historia no es una lista aburrida de años y batallas, 
          sino una colección infinita de momentos que definieron quiénes somos hoy.
        </p>
      </section>

      {/* --- SECCIÓN 2: LA MISIÓN --- */}
      <section className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-stone-900/50 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-merriweather text-stone-800 dark:text-stone-100">
            ¿Por qué este proyecto?
          </h2>
          <div className="space-y-3 text-stone-600 dark:text-stone-400">
            <p>
              En medio del vértigo moderno, olvidamos que cada día está conectado con historias fascinantes de hace 50, 100 o 500 años. 
              La historia no solo nos enseña, sino que nos sorprende y nos inspira cuando nos permitimos descubrirla.
            </p>
            <p>
              El objetivo es ofrecer una píldora diaria de conocimiento: curada, visual y 
              fácil de digerir. Sin ruido, solo la fascinación de descubrir el pasado.
            </p>
          </div>
        </div>
        
        {/* Decoración visual simple */}
        <div className="relative h-48 md:h-full bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <Heart className="text-stone-300 dark:text-stone-700 w-24 h-24" />
        </div>
      </section>

      {/* --- SECCIÓN 3: EL CREADOR (TÚ) --- */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Code2 size={20} className="text-amber-600" />
          Detrás del código
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-6 p-6 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          {/* Avatar / Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-2xl border-2 border-white dark:border-stone-700 shadow-md">
              👋
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Marcos Caballero
              </h4>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Estudiante de ingeniería & Entusiasta del aprendizaje
              </p>
            </div>
            
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              ¡Hola! Soy un estudiante español inmerso en el doble reto de la Ingeniería Biomédica y Mecánica. 
              Cuando no estoy entre libros, dedico mi tiempo a construir mis propios proyectos e intentar entender cómo funciona el mundo.
            </p>
            
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              La ingeniería requiere recursos. Si quieres apoyar mi camino o aportar directamente para los sensores, motores y el filamento 3D que uso en mis proyectos, te estaré increíblemente agradecido. ¡Gracias por pasarte por aquí!
            </p>

            {/* Redes Sociales */}
            <div className="flex gap-4 pt-2">
              <a 
                href="https://github.com/marcoscaballero" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://twitter.com/tu_usuario" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 4: CALL TO ACTION --- */}
      <section className="text-center pt-8 border-t border-stone-200 dark:border-stone-800">
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          ¿Te gusta el proyecto? Considera apoyar el desarrollo, mi carrera y otros proyectos.
        </p>
        
        <a 
          href={process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Coffee size={20} />
          Apoya este proyecto
        </a>
      </section>

    </div>
  );
}