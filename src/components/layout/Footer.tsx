import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 py-6 px-4 md:h-16 md:flex-row md:py-0 md:px-2">
        
        {/* BLOQUE IZQUIERDO: Identidad + Copyright */}
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Project Chronos
          </span>
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
            Reportar Bug / Sugerencia
          </Link>
          {/* CAMBIO: Enlace de Donaciones en lugar de GitHub */}
          <Link 
            href={process.env.BUY_ME_A_COFFEE_URL || "https://buymeacoffee.com/marcoscaballero"}
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors font-semibold text-primary/90"
          >
            ☕ Invítame a un café
          </Link>
        </nav>

        {/* Copyright visible solo en móvil */}
        <p className="text-xs text-muted-foreground md:hidden">
            &copy; {currentYear} Marcos Caballero
        </p>

      </div>
    </footer>
  );
};

export default Footer;