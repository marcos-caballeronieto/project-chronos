import os
import json
import shutil
import time
import warnings # Para controlar los avisos
import psycopg2
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# Silenciar el aviso de deprecación de Google para mantener la consola limpia
warnings.filterwarnings("ignore", category=FutureWarning)

load_dotenv()

# Configuración
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
INPUT_FILE = "generated_event.json"
ARCHIVE_DIR = "archive"

# --- FUNCIONES DE AUDITORÍA ---

def clean_json_response(text):
    text = text.strip()
    # Limpieza agresiva de Markdown
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return text.strip()

def review_and_fix_content(event_data):
    """
    Envía el evento a Gemini para Fact-Checking.
    """
    print(f"🧐 El Editor está revisando: '{event_data['title']}'...")
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    json_str = json.dumps(event_data, ensure_ascii=False)
    
    prompt = f"""
    Actúa como Editor (Fact-Checker). Revisa este JSON:
    {json_str}
    
    TAREA:
    1. Verifica datos históricos.
    2. Mejora el estilo de 'story' para que sea atrapante.
    3. Asegura que el formato sea JSON válido.
    
    IMPORTANTE: Devuelve SOLO el JSON corregido. Sin markdown, sin explicaciones previas.
    """

    try:
        response = model.generate_content(prompt)
        time.sleep(2)
        
        if not response.text:
            raise ValueError("Respuesta vacía de la IA")

        corrected_text = clean_json_response(response.text)
        return json.loads(corrected_text)
        
    except Exception as e:
        print(f"⚠️ El Editor tuvo un problema ({e}). Usaremos el borrador original.")
        return event_data 

# --- BASE DE DATOS E IMAGEN ---

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def get_generated_event():
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ No encontré '{INPUT_FILE}'.")
        exit()

def get_unsplash_image(query):
    # Simplificamos la query para evitar errores de búsqueda
    clean_query = query.split(",")[0] # Usamos solo la categoría principal o primera palabra
    print(f"🎨 Buscando foto para: {clean_query}...")
    return f"[https://source.unsplash.com/1600x900/](https://source.unsplash.com/1600x900/)?{clean_query}"

def archive_file(event_title):
    if not os.path.exists(ARCHIVE_DIR):
        os.makedirs(ARCHIVE_DIR)
    
    safe_title = "".join([c for c in event_title if c.isalnum() or c in (' ', '-', '_')]).strip()
    safe_title = safe_title.replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_filename = f"{timestamp}_{safe_title}.json"
    
    shutil.move(INPUT_FILE, os.path.join(ARCHIVE_DIR, new_filename))
    print(f"🗄️  Archivo guardado en: {ARCHIVE_DIR}/{new_filename}")

def save_to_supabase(event, image_url):
    print("🚀 Subiendo a Supabase...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Insertar Evento
        cur.execute("""
            INSERT INTO "Event" (
                id, date, year, title, description, category, 
                "imageUrl", "imageCredit", "story", "funFact", 
                "lastShownAt", "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, %s, %s,
                %s, 'Unsplash Source', %s, %s,
                NULL, NOW(), NOW()
            ) RETURNING id;
        """, (
            event['date'], event['year'], event['title'], event['description'], event['category'],
            image_url, event['story'], event['funFact']
        ))
        
        event_id = cur.fetchone()[0]
        
        # 2. Insertar Glosario
        if 'glossary' in event and event['glossary']:
            for term in event['glossary']:
                cur.execute("""
                    INSERT INTO "GlossaryTerm" (id, term, definition, "eventId")
                    VALUES (gen_random_uuid(), %s, %s, %s);
                """, (term['term'], term['definition'], event_id))

        # 3. Insertar Tags (MANUALMENTE PARA EVITAR EL ERROR DE CONFLICTO)
        if 'tags' in event and event['tags']:
            for tag_name in event['tags']:
                # Paso A: Comprobar si el tag ya existe
                cur.execute('SELECT id FROM "Tag" WHERE name = %s', (tag_name,))
                res = cur.fetchone()
                
                if res:
                    # Si existe, no hacemos nada (en el futuro aquí haríamos la relación)
                    pass 
                else:
                    # Si no existe, lo creamos
                    cur.execute("""
                        INSERT INTO "Tag" (id, name) VALUES (gen_random_uuid(), %s);
                    """, (tag_name,))
        
        conn.commit()
        print(f"✅ ¡PUBLICADO! '{event['title']}' está online.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error CRÍTICO en DB: {e}")
        return False
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    draft_data = get_generated_event()
    final_data = review_and_fix_content(draft_data)
    
    # Usamos Category y Year para la imagen
    query = f"{final_data['category']},{final_data['year']}"
    image_url = get_unsplash_image(query)
    
    success = save_to_supabase(final_data, image_url)
    
    if success:
        archive_file(final_data['title'])