import os
import json
import time  # Importamos time para la pausa
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

QUEUE_FILE = "queue.json"
OUTPUT_FILE = "generated_event.json"

def get_next_topic_from_queue():
    if not os.path.exists(QUEUE_FILE):
        print("❌ Error: No existe 'queue.json'.")
        exit()
        
    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
        try:
            queue = json.load(f)
        except:
            queue = []
            
    if not queue:
        print("📭 La cola está vacía.")
        return None

    next_topic = queue.pop(0)
    
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)
        
    return next_topic

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return text

def generate_history(topic):
    print(f"✍️  Investigando y escribiendo sobre: '{topic}'...")
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # --- PROMPT AVANZADO DE ESCRITURA ---
    prompt = f"""
    Actúa como un historiador riguroso y un narrador experto (estilo 'Narrative Non-fiction').
    
    OBJETIVO: Escribir un artículo premium sobre: "{topic}".
    
    INSTRUCCIONES DE ESTILO Y RIGOR:
    1. **Narrativa:** No escribas como una enciclopedia aburrida. Usa un tono humano, atrapante, que cuente una historia con principio, nudo y desenlace. Evita frases robóticas como "En conclusión" o "Cabe destacar".
    2. **Rigor:** Verifica mentalmente los datos. Prioriza la precisión histórica sobre el dramatismo excesivo.
    3. **Estructura:** Usa Markdown. Párrafos cortos. Negritas para conceptos clave.
    
    INSTRUCCIONES DE METADATOS:
    1. **Tags:** Selecciona entre 2 y 5 categorías clave (ej: "Guerra Fría", "Espionaje", "Siglo XX").
    2. **Glosario:** Identifica 2-4 términos QUE APAREZCAN EN TU TEXTO que un lector promedio podría no conocer. Pueden ser:
       - Nombres de personas clave.
       - Nombres de operaciones militares o tratados.
       - Términos técnicos o en otros idiomas.
    
    SALIDA JSON OBLIGATORIA:
    {{
      "date": "YYYY-MM-DD", (Fecha precisa del evento)
      "year": 1969,
      "title": "{topic}", (Puedes mejorarlo para que sea más 'clicky' pero fiel)
      "description": "Descripción para redes sociales (max 140 caracteres).",
      "category": "History", (Elige la mejor: History, Science, Art, Technology, Space, Mystery)
      "story": "El artículo completo en Markdown...",
      "funFact": "Un dato curioso (Trivia) sorprendente y poco conocido.",
      "tags": ["tag1", "tag2"],
      "glossary": [
        {{ "term": "Palabra/Nombre", "definition": "Contexto breve de quién o qué es." }}
      ],
      "imagePrompt": "Descripción detallada en INGLÉS para generar una imagen fotorrealista (cinematic lighting, 8k, highly detailed)."
    }}
    """

    try:
        response = model.generate_content(prompt)
        # Pausa de seguridad para respetar el Rate Limit de la API
        time.sleep(2) 
        return json.loads(clean_json_response(response.text))
        
    except Exception as e:
        print(f"❌ Error generando contenido: {e}")
        return None

if __name__ == "__main__":
    topic = get_next_topic_from_queue()
    
    if topic:
        data = generate_history(topic)
        
        if data:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Calculamos cuántos quedan
            remaining = len(json.load(open(QUEUE_FILE)))
            print(f"✅ Artículo generado: '{data['title']}'")
            print(f"📉 Quedan {remaining} temas en la cola.")
            print("⏳ Pausa de seguridad aplicada.")