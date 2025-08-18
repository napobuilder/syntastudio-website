import os
from dotenv import load_dotenv
from fase1_collector import collect_sources
from fase2_curator import select_best_content
from fase3_writer import generate_article_from_content
from fase4_publisher import publish_article

def main():
    print("Iniciando el motor de contenidos de Synta Studio...")
    load_dotenv()
    
    # Fase 1: Recolectar noticias y artículos
    raw_content_list = collect_sources()
    if not raw_content_list:
        print("No se encontró contenido nuevo. Finalizando.")
        return

    # Fase 2: Seleccionar el mejor contenido para un artículo
    chosen_content = select_best_content(raw_content_list)
    if not chosen_content:
        print("Ningún contenido pasó el filtro de curación. Finalizando.")
        return

    # Fase 3: Usar IA para generar el artículo completo
    article_data = generate_article_from_content(chosen_content)
    if not article_data:
        print("La IA no pudo generar el artículo. Finalizando.")
        return

    # Fase 4: Construir el HTML y publicarlo en el repositorio
    publish_article(article_data)

    print("¡Flujo de contenidos completado exitosamente!")

if __name__ == "__main__":
    main()