import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Ajustes de espaciado:
         - max-w-7xl: Evita que en pantallas gigantes se separe demasiado.
         - px-6 md:px-12: Añade ese "margen" lateral que pedías para que respire.
         - h-16: Fija la altura en escritorio para que sea compacta.
      */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 py-6 px-4 md:h-16 md:flex-row md:py-0 md:px-2">
        
        {/* BLOQUE IZQUIERDO: Identidad + Copyright */}
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Project Chronos
          </span>
          {/* Separador vertical sutil, solo visible en escritorio */}
          <span className="hidden text-muted-foreground/30 md:block">|</span>
          <p className="hidden text-xs text-muted-foreground md:block">
            &copy; {currentYear} Marcos Caballero
          </p>
        </div>

        {/* BLOQUE DERECHO: Navegación */}
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link 
            href="/about" 
            className="hover:text-primary transition-colors"
          >
            Sobre mí
          </Link>
          <Link 
            href="/bugs" 
            className="hover:text-primary transition-colors"
          >
            Reportar Bug
          </Link>
          <Link 
            href="https://github.com/marcos-caballeronieto/project-chronos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </Link>
        </nav>

        {/* Copyright visible solo en móvil (para que quede abajo del todo en la pila) */}
        <p className="text-xs text-muted-foreground md:hidden">
            &copy; {currentYear} Marcos Caballero
        </p>

      </div>
    </footer>
  );
};

export default Footer;