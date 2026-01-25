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
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
INPUT_FILE = "generated_event.json"
ARCHIVE_DIR = "archive"

# --- CONFIGURACIÓN DE CABECERAS (IMPORTANTE PARA WIKIPEDIA) ---
# Sin esto, Wikipedia bloquea el script creyendo que es un bot malicioso.
HEADERS = {
    "User-Agent": "ProjectChronos/1.0 (marcos@example.com)" 
}

# --- 1. BUSCADOR WIKIMEDIA COMMONS (CORREGIDO) ---
def search_commons_files(query, limit=5):
    print(f"   🏛️  Buscando en Wikimedia Commons: '{query}'...")
    
    url = "https://commons.wikimedia.org/w/api.php"
    candidates = []
    
    try:
        # Intento 1: Búsqueda específica de imágenes
        search_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": f"{query} filetype:bitmap", # Solo mapas de bits (fotos)
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
            search_params['srsearch'] = query
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

# --- 2. BUSCADOR UNSPLASH (FALLBACK) ---
def search_unsplash(query):
    if not UNSPLASH_ACCESS_KEY: return None
    try:
        # Búsqueda más laxa para encontrar siempre algo
        clean_query = query.split(",")[0] 
        res = requests.get("https://api.unsplash.com/photos/random", params={
            "query": clean_query, "orientation": "landscape", "client_id": UNSPLASH_ACCESS_KEY
        }, timeout=5)
        if res.status_code == 200:
            data = res.json()
            return {
                "source": "Unsplash",
                "title": "Arte/Foto Stock",
                "url": data['urls']['regular'],
                "credit": f"Foto por {data['user']['name']} en Unsplash"
            }
    except: pass
    return None

# --- 3. SELECCIÓN ---
def select_best_image(event_data):
    # Usamos el término de búsqueda, y si falla, usamos el título pero cortado (primeras 4 palabras)
    search_term = event_data.get('imageSearchTerm', " ".join(event_data['title'].split()[:4]))
    
    print("\n" + "="*60)
    print(f"🖼️  SELECTOR DE IMÁGENES")
    print(f"🔍 Término usado: '{search_term}'")
    print("="*60)
    
    options = []
    
    # 1. Commons
    options.extend(search_commons_files(search_term, limit=5))
    
    # 2. Unsplash
    unsplash_res = search_unsplash(f"{event_data['category']} {event_data['year']}")
    if unsplash_res: options.append(unsplash_res)
    
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
                return {
                    "url": input("Pegar URL: ").strip(),
                    "credit": input("Crédito: ").strip() or "Archivo"
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
    print(f"🧐 Editor IA: Generando keywords de búsqueda...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    json_str = json.dumps(event_data, ensure_ascii=False)
    
    # Prompt optimizado para sacar keywords en inglés para Commons
    prompt = f"""
    Actúa como Editor. Revisa este JSON: {json_str}.
    TAREAS:
    1. Corrige datos y estilo.
    2. Genera campo "imageSearchTerm":
       - Debe ser el SUJETO PRINCIPAL en INGLÉS.
       - Commons funciona mejor con inglés.
       - Ejemplo: "Guerra Civil Española" -> "Spanish Civil War".
    Devuelve JSON válido.
    """
    try:
        response = model.generate_content(prompt)
        time.sleep(1)
        if not response.text: return event_data
        return json.loads(clean_json_response(response.text))
    except:
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

if __name__ == "__main__":
    # Asegúrate de tener el archivo generado
    draft = get_generated_event()
    
    # Revisión y Keywords
    final = review_and_fix_content(draft)
    
    # Selección de imagen
    image_data = select_best_image(final)
    
    # Guardado
    if save_to_supabase(final, image_data):
        archive_file(final['title'])