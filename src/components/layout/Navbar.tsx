"use client";
import Link from "next/link";
import { Moon, Sun, Hourglass } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-amber-600 p-1.5 rounded-lg text-white"><Hourglass size={20} /></div>
          <span className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">Chronos</span>
        </Link>
        {mounted && (
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 text-stone-600 dark:text-stone-400">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>
    </header>
  );
}