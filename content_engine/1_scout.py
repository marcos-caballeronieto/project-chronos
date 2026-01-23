import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Cargar claves
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

LOG_FILE = "covered_topics.txt"
QUEUE_FILE = "queue.json"
BATCH_SIZE = 10  # ¿Cuántos quieres generar de golpe?

def get_local_titles():
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return [line.strip() for line in f.readlines() if line.strip()]

def save_titles_to_log(titles_list):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        for title in titles_list:
            f.write(f"{title}\n")

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return text

def suggest_batch_topics(existing_titles):
    print(f"📚 Consultando registro: {len(existing_titles)} temas ya cubiertos.")
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Si hay muchos temas, solo le pasamos los últimos 50 para no saturar el prompt innecesariamente
    lista_texto = ", ".join(existing_titles[-50:]) if existing_titles else "Ninguno."
    
    prompt = f"""
    Actúa como Curador de museo. Necesito una lista de {BATCH_SIZE} temas NUEVOS para artículos.
    
    TEMAS YA CUBIERTOS (EVITAR REPETIR):
    [{lista_texto}]
    
    CRITERIOS:
    1. Busca "Joyas Ocultas" o curiosidades históricas/científicas fascinantes.
    2. Variedad: Mezcla épocas y categorías (Ciencia, Historia, Arte, Espacio).
    3. Títulos atractivos pero rigurosos.
    
    FORMATO DE SALIDA:
    Responde ÚNICAMENTE con un Array JSON de strings.
    Ejemplo: ["La Guerra del Emú", "El Gran Incendio de Londres", "La invención del cero"]
    """

    response = model.generate_content(prompt)
    try:
        clean_text = clean_json_response(response.text)
        return json.loads(clean_text)
    except Exception as e:
        print(f"❌ Error al parsear JSON de Gemini: {e}")
        return []

if __name__ == "__main__":
    print(f"🧠 El Curador está buscando {BATCH_SIZE} temas nuevos...")
    
    try:
        # 1. Leer historial
        titulos = get_local_titles()
        
        # 2. Generar Batch
        nuevos_temas = suggest_batch_topics(titulos)
        
        if nuevos_temas:
            print(f"💎 ¡Éxito! Se han encontrado {len(nuevos_temas)} temas:")
            for t in nuevos_temas:
                print(f"   - {t}")
            
            # 3. Guardar en la COLA (queue.json)
            # Si ya había cosas en la cola, las mantenemos y añadimos las nuevas
            current_queue = []
            if os.path.exists(QUEUE_FILE):
                with open(QUEUE_FILE, "r", encoding="utf-8") as f:
                    try:
                        current_queue = json.load(f)
                    except:
                        current_queue = []
            
            current_queue.extend(nuevos_temas)
            
            with open(QUEUE_FILE, "w", encoding="utf-8") as f:
                json.dump(current_queue, f, indent=2, ensure_ascii=False)
            
            # 4. Registrar en historial permanente
            save_titles_to_log(nuevos_temas)
            print(f"\n✅ Guardados en '{QUEUE_FILE}' y registrados en '{LOG_FILE}'.")
        else:
            print("⚠️ No se generaron temas.")
            
    except Exception as e:
        print(f"❌ Error fatal: {e}")