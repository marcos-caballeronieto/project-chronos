import React from "react";

interface BookRecommendationProps {
  title?: string;
  description?: string;
  bookImage?: string; // URL de la portada del libro
  bookTitle?: string; // Título del libro
  amazonLink?: string; // Enlace de afiliado de Amazon
}

const BookRecommendation: React.FC<BookRecommendationProps> = ({
  title = "📚 Para profundizar más",
  description = "Si te interesa este tema, te recomiendo este libro:",
  bookImage = "https://via.placeholder.com/200x300/f0f0f0/888888?text=Portada+del+Libro", // Placeholder
  bookTitle = "Título del Libro",
  amazonLink = "#", // Placeholder link
}) => {
  return (
    <div className="mt-8 bg-blanco-roto dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6 text-center max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
          {description}
        </p>
      )}
      {/* Tarjeta del libro */}
      <div className="flex flex-col items-center space-y-4">
        <a href={amazonLink} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={bookImage}
            alt={`Portada de ${bookTitle}`}
            className="w-32 h-48 object-cover rounded-md shadow-md hover:shadow-lg transition-shadow"
          />
        </a>
        <h4 className="text-md font-bold text-stone-800 dark:text-stone-100 text-center">
          {bookTitle}
        </h4>
        <a
          href={amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Ver precio en Amazon
        </a>
      </div>
      {/* Disclaimer legal obligatorio */}
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
        En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables, esto ayuda a mantener la web así como a seguir mejorandola con nuevo contenido y funcionalidades. Gracias por tu apoyo.
      </p>
    </div>
  );
};

export default BookRecommendation;