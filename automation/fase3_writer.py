import os
import json
import google.generativeai as genai
from slugify import slugify

def generate_article_from_content(content):
    print(f"Fase 3: Generando artículo sobre: {content['title']}")
    
    prompt = f"""
    Actúa como un Especialista SEO y Redactor de Contenidos de clase mundial para Synta Studio.
    Tu objetivo es tomar la siguiente noticia y convertirla en un artículo de blog altamente optimizado que no solo informe, sino que esté diseñado para posicionarse en primer lugar en Google y competir por fragmentos destacados (featured snippets).

    NOTICIA ORIGINAL:
    Título: "{content['title']}"
    Contenido: "{content['content'][:2000]}"

    TAREAS:
    Genera un objeto JSON que contenga los siguientes campos:

    1.  "title": Un título para el post (máx. 60 caracteres), magnético y que incluya la palabra clave principal.
    2.  "meta_description": Una meta descripción (máx. 155 caracteres) escrita para maximizar el CTR. Debe generar curiosidad y resumir el beneficio principal del artículo.
    3.  "category": Asigna UNA de estas categorías: Estrategia, Diseño, Tecnología.
    4.  "image_alt": Un texto alternativo descriptivo y optimizado para SEO para la imagen principal.
    5.  "main_keyword": La palabra clave principal o frase de larga cola del artículo.
    6.  "related_keywords": Una lista de 3 a 5 palabras clave secundarias o relacionadas.
    7.  "content_markdown": El cuerpo del artículo (~800 palabras) en formato Markdown.
        -   Debe estar estructurado con encabezados H2 y H3 para máxima legibilidad.
        -   Debe integrar de forma natural la palabra clave principal y las secundarias.
        -   El tono debe ser el de Synta Studio: experto, directo y ligeramente futurista.
    8.  "faq_section": Una lista de 3 preguntas y respuestas.
        -   Cada elemento de la lista debe ser un objeto con dos claves: "question" y "answer".
        -   Las preguntas deben ser formuladas como las buscaría un usuario en Google (ej: "¿Cómo afecta la IA al SEO?").
        -   Las respuestas deben ser concisas y directas (2-3 frases).

    RESPONDE ÚNICAMENTE CON EL OBJETO JSON. NO INCLUYAS NINGÚN OTRO TEXTO ANTES O DESPUÉS.
    """
    
    # --- LLAMADA REAL A LA API (Ejemplo con Gemini) ---
    # genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # model = genai.GenerativeModel('gemini-pro')
    # response = model.generate_content(prompt)
    # generated_data = json.loads(response.text)

    # --- DATOS SIMULADOS PARA PRUEBAS ---
    generated_data = {
        "title": "La Nueva IA de OpenAI que Compone Música",
        "meta_description": "¿Puede una IA componer una sinfonía? Descubre Jukebox, el nuevo modelo de OpenAI que está revolucionando la industria musical y la creación de contenido.",
        "category": "Tecnología",
        "image_alt": "Ondas de sonido generadas por inteligencia artificial en una pantalla de computadora.",
        "main_keyword": "IA generadora de música",
        "related_keywords": ["OpenAI Jukebox", "música con IA", "futuro de la composición musical"],
        "content_markdown": "## La Barrera del Sonido se ha Roto\n\nLa inteligencia artificial ha conquistado el texto y la imagen, pero la música seguía siendo una frontera esquiva. Hasta ahora. OpenAI, el laboratorio detrás de DALL-E y GPT-4, ha presentado **Jukebox**, un modelo que no solo imita, sino que compone música con una complejidad asombrosa.\n\n### ¿Cómo Funciona Jukebox?\n\nA diferencia de otros modelos, Jukebox trabaja con audio en bruto, lo que le permite capturar matices, timbres y emociones que antes eran imposibles para una máquina. El resultado es una pieza musical coherente en género, instrumentación e incluso con voces cantadas.",
        "faq_section": [
            {"question": "¿Qué es OpenAI Jukebox?", "answer": "Jukebox es un sistema de inteligencia artificial creado por OpenAI que puede generar música original en una variedad de géneros y estilos, incluyendo voces rudimentarias."}, 
            {"question": "¿Puede la IA reemplazar a los compositores humanos?", "answer": "Por ahora, la IA como Jukebox es una herramienta para potenciar la creatividad humana, no para reemplazarla. Ofrece a los músicos nuevas vías de inspiración y colaboración."}, 
            {"question": "¿Cómo puedo usar la música generada por IA?", "answer": "La música generada por IA puede usarse para bandas sonoras de videos, música de fondo para podcasts o como punto de partida para nuevas composiciones, siempre revisando los términos de licencia."} 
        ]
    }

    word_count = len(generated_data['content_markdown'].split())
    generated_data['reading_time'] = round(word_count / 200) or 1
    generated_data['slug'] = slugify(generated_data['title'])
    
    print(f"Artículo generado exitosamente con el título: {generated_data['title']}")
    return generated_data
