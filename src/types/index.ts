// src/types/index.ts

export interface GlossaryTerm {
  term: string;       // La palabra clave (ej: "Renacimiento")
  definition: string; // La explicación que saldrá en el popup
}

export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  
  imageUrl: string;
  imageCredit: string;
  imagePosition?: string;

  story: string;
  funFact: string;
  year: number;
  tags?: string[];
  
  // Nuevo campo opcional para el glosario
  glossary?: GlossaryTerm[];
}