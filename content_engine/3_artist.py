import os
import json
import shutil
import time
import warnings
import requests # Necesario para llamar a la API
import psycopg2
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# Silenciar avisos
warnings.filterwarnings("ignore", category=FutureWarning)

load_dotenv()

# Configuración
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# CARPETAS DEL SISTEMA DE COLAS
DRAFTS_DIR = "drafts"    # 📥 Bandeja de entrada
ARCHIVE_DIR = "archive"  # 🗄️ Archivo procesado
INPUT_FILE = None        # Se asigna dinámicamente desde drafts

# Cabecera para Wikipedia
HEADERS = {
    "User-Agent": "ProjectChronos/1.0 (marcos@example.com)" 
}

# --- 1. GESTIÓN DE COLAS (NUEVO) ---
def get_next_draft_file():
    """Busca el primer archivo JSON en la carpeta drafts."""
    if not os.path.exists(DRAFTS_DIR):
        return None
    
    files = [f for f in os.listdir(DRAFTS_DIR) if f.endswith(".json")]
    if not files:
        return None
    
    # Devolvemos la ruta completa del primer archivo
    return os.path.join(DRAFTS_DIR, files[0])

# --- 1.5 GENERADOR DE TÉRMINO DE BÚSQUEDA (IA) ---
def generate_search_term(full_title):
    """Usa IA para extraer el término de búsqueda más efectivo para Wikimedia Commons."""
    # TODO: TEMPORAL - Volver a 'gemini-2.5-flash' cuando termine el periodo de pruebas
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    prompt = f"""Genera el MEJOR término de búsqueda para Wikimedia Commons capturando el tema principal del título.

ENTRADA: "{full_title}"

INSTRUCCIONES CLAVE:
1) Identifica el sujeto central (persona, lugar, evento o invento) y usa ese núcleo como búsqueda.
2) Usa 1-3 palabras MÁX.; prioriza nombres propios o conceptos específicos que existan en Commons.
3) Evita relleno: sin artículos, preposiciones ni adjetivos genéricos; nada de frases largas.
4) Si hay ambigüedad, elige la formulación más precisa y breve para asegurar resultados fieles al tema.
5) Idioma: inglés para temas históricos internacionales; español si es claramente local.

EJEMPLOS:
- "La Fascinante Metrópolis de Cahokia" → "Cahokia"
- "La Guerra Civil Española del Siglo XX" → "Spanish Civil War"
- "El Descubrimiento de la Penicilina por Fleming" → "Penicillin Fleming"
- "La Revolución Industrial en Inglaterra" → "Industrial Revolution"
- "El Imperio Mexica y Tenochtitlán" → "Tenochtitlan"

SALIDA: SOLO el término de búsqueda (sin comillas, sin explicación), 1-3 palabras.
"""
    
    try:
        response = model.generate_content(prompt)
        time.sleep(0.5)
        search_term = response.text.strip()
        return search_term
    except:
        # Fallback: simplemente las primeras 2 palabras
        words = full_title.split()
        return " ".join(words[:2]) if len(words) > 1 else words[0]

# --- 2. BUSCADOR WIKIMEDIA COMMONS (CORREGIDO) ---
def search_commons_files(query, limit=5):
    # Generar término de búsqueda óptimo con IA
    optimized_query = generate_search_term(query)
    
    print(f"   🏛️  Buscando en Wikimedia Commons: '{optimized_query}'...")
    
    url = "https://commons.wikimedia.org/w/api.php"
    candidates = []
    
    try:
        # Intento 1: Búsqueda específica de imágenes
        search_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": f"{optimized_query} filetype:bitmap", # Solo mapas de bits (fotos)
            "srnamespace": 6, # Espacio de nombres 'File:'
            "srlimit": limit
        }
        
        r = requests.get(url, params=search_params, headers=HEADERS, timeout=10)
        data = r.json()
        
        # Si falla, imprimimos para depurar
        if "error" in data:
            print(f"      ⚠️ Error API Commons: {data['error'].get('info')}")
            return []

        search_results = data.get('query', {}).get('search', [])
        
        # Si no hay resultados, probamos sin el filtro 'filetype' (Intento 2)
        if not search_results:
            print("      ⚠️ Filtro estricto sin resultados. Probando búsqueda general...")
            search_params['srsearch'] = optimized_query
            r = requests.get(url, params=search_params, headers=HEADERS, timeout=10)
            search_results = r.json().get('query', {}).get('search', [])

        if not search_results:
            print("      ❌ Commons no encontró NADA. (Revisa el término de búsqueda)")
            return []

        # Obtener URLs reales
        titles = "|".join([item['title'] for item in search_results])
        params_info = {
            "action": "query",
            "format": "json",
            "titles": titles,
            "prop": "imageinfo",
            "iiprop": "url|user|extmetadata"
        }
        
        r_info = requests.get(url, params=params_info, headers=HEADERS, timeout=10)
        pages = r_info.json().get('query', {}).get('pages', {})
        
        for _, page in pages.items():
            if 'imageinfo' in page:
                info = page['imageinfo'][0]
                # Filtrar iconos pequeños o banderas irrelevantes si es posible
                if info.get('url', '').endswith('.svg'): continue 

                author = info.get('user', 'Wikimedia Commons')
                try:
                    meta = info.get('extmetadata', {})
                    if 'Artist' in meta:
                        author = meta['Artist']['value'].replace('<', ' <').split('<')[0].strip()
                except: pass

                candidates.append({
                    "source": "Commons",
                    "title": page['title'].replace("File:", ""),
                    "url": info['url'],
                    "credit": f"Fuente: Commons ({author})"
                })

    except Exception as e:
        print(f"      ⚠️ Error conexión: {e}")
    
    return candidates

# --- 3. SELECCIÓN ---
def select_best_image(event_data):
    # Por defecto generamos el término con IA (mejor rendimiento que usar el que venga en el borrador)
    search_term = generate_search_term(event_data.get('title', ''))
    event_data['imageSearchTerm'] = search_term  # guardamos el que la IA propone
    
    print("\n" + "="*60)
    print(f"🖼️  SELECTOR DE IMÁGENES")
    print(f"🔍 Término usado: '{search_term}'")
    print("="*60)
    
    options = []
    
    # 1. Commons
    # 1. Commons
    options.extend(search_commons_files(search_term, limit=5))
    
    # MOSTRAR
    print("\nOPCIONES ENCONTRADAS:")
    if not options: print("   (Sin resultados automáticos. Usa manual)")
    
    for i, opt in enumerate(options):
        print(f"\n[{i+1}] {opt['source']} - {opt['title'][:60]}...")
        print(f"    🔗 {opt['url']}")
    
    print(f"\n[{len(options)+1}] MANUAL (Pegar URL)")
    
    while True:
        try:
            sel = input(f"\n👉 Elige (1-{len(options)+1}): ").strip()
            idx = int(sel) - 1
            if 0 <= idx < len(options): return {"url": options[idx]['url'], "credit": options[idx]['credit']}
            elif idx == len(options):
                url = input("Pegar URL: ").strip()
                credito_nombre = input("Crédito (nombre del autor): ").strip() or "Desconocido"
                via = input("Vía (fuente, ej: Wikimedia Commons): ").strip() or "Archivo"
                credit_formatted = f"Crédito a: {credito_nombre} (Via {via})"
                return {
                    "url": url,
                    "credit": credit_formatted
                }
        except: pass

# --- RESTO DEL SCRIPT (AUDITORIA, DB, ETC) ---

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return text.strip()

def review_and_fix_content(event_data):
    print(f"🧐 Editor IA revisando borrador...")
    # TODO: TEMPORAL - Volver a 'gemini-2.5-flash' cuando termine el periodo de pruebas
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    # Prompt enfocado en mantener campos críticos y mejorar narrativa
    prompt = f"""
    Actúa como Editor. Revisa este JSON: {json.dumps(event_data, ensure_ascii=False)}. 
    
    TAREAS:
    1. Mejora el estilo narrativo de 'story' y 'funFact'.
    2. NO elimines ni cambies los campos 'year' ni 'date'.
    (El término de búsqueda de imagen lo gestiona otra función, no lo modifiques aquí.)
    
    Devuelve el JSON válido completo.
    """
    try:
        res = model.generate_content(prompt)
        time.sleep(1)
        text = res.text.strip()
        if text.startswith("```"): text = text.split("\n", 1)[1].rsplit("\n", 1)[0]
        return json.loads(text)
    except Exception as e:
        print(f"⚠️ Fallo en la IA ({e}). Usando borrador original.")
        return event_data

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def get_generated_event():
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ No encontré '{INPUT_FILE}'. Asegúrate de ejecutar el paso 2 primero.")
        exit()

def archive_file(event_title):
    if not os.path.exists(ARCHIVE_DIR): os.makedirs(ARCHIVE_DIR)
    safe_title = "".join([c for c in event_title if c.isalnum() or c in (' ', '-', '_')]).strip().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.move(INPUT_FILE, os.path.join(ARCHIVE_DIR, f"{timestamp}_{safe_title}.json"))
    print(f"🗄️  Archivado.")

def save_to_supabase(event, image_data):
    print("🚀 Subiendo a Supabase...")
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO "Event" (
                id, date, year, title, description, category, 
                "imageUrl", "imageCredit", "story", "funFact", 
                "lastShownAt", "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                NULL, NOW(), NOW()
            ) RETURNING id;
        """, (
            event['date'], event['year'], event['title'], event['description'], event['category'],
            image_data['url'], image_data['credit'], event['story'], event['funFact']
        ))
        event_id = cur.fetchone()[0]
        
        if 'glossary' in event:
            for term in event['glossary']:
                cur.execute('INSERT INTO "GlossaryTerm" (id, term, definition, "eventId") VALUES (gen_random_uuid(), %s, %s, %s)', (term['term'], term['definition'], event_id))
        
        if 'tags' in event:
            for tag in event['tags']:
                cur.execute('SELECT id FROM "Tag" WHERE name = %s', (tag,))
                if not cur.fetchone():
                    cur.execute('INSERT INTO "Tag" (id, name) VALUES (gen_random_uuid(), %s)', (tag,))
        
        conn.commit()
        print(f"✅ ¡PUBLICADO! '{event['title']}' está online.")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error DB: {e}")
        return False
    finally:
        cur.close()
        conn.close()

def archive_processed_draft(filepath, title):
    if not os.path.exists(ARCHIVE_DIR): os.makedirs(ARCHIVE_DIR)
    safe = "".join([c for c in title if c.isalnum() or c in (' ','_')]).strip().replace(" ","_")
    new_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{safe}.json"
    shutil.move(filepath, os.path.join(ARCHIVE_DIR, new_name))
    print("🗄️  Borrador archivado.")

if __name__ == "__main__":
    # 1. BUSCAR BORRADOR EN LA COLA
    INPUT_FILE = get_next_draft_file()
    
    if not INPUT_FILE:
        print("📭 No hay borradores pendientes en la carpeta 'drafts/'.")
        print("   (Ejecuta 'python 2_historian.py' para generar algunos).")
    else:
        print(f"📄 Procesando borrador: {INPUT_FILE}")
        
        # Cargar datos
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            draft_data = json.load(f)
            
        # Pipeline normal
        final_data = review_and_fix_content(draft_data)

        # Restaurar campos críticos si la IA los omite
        critical_fields = ['year', 'date', 'category', 'title', 'tags']
        for key in critical_fields:
            if key not in final_data or final_data[key] is None:
                if key in draft_data:
                    final_data[key] = draft_data[key]
                    print(f"🔧 Campo recuperado del original: '{key}'")

        image_data = select_best_image(final_data)
        
        if save_to_supabase(final_data, image_data):
            # IMPORTANTE: Pasamos la ruta del archivo original para moverlo
            archive_processed_draft(INPUT_FILE, final_data['title'])