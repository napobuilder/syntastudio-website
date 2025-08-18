import os
import json
import markdown2
from datetime import datetime
from slugify import slugify
from git import Repo, Actor
import re

def publish_article(article_data):
    print(f"Fase 4: Publicando el artículo: {article_data['title']}")
    
    repo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    repo = Repo(repo_path)
    
    # --- 1. Generar y guardar la imagen destacada (placeholder) ---
    image_filename = f"{article_data['slug']}.png"
    image_repo_path = os.path.join('public', 'images', image_filename)
    # Lógica para generar la imagen y guardarla en os.path.join(repo_path, image_repo_path)
    # Por ahora, creamos un archivo vacío para que Git lo rastree
    open(os.path.join(repo_path, image_repo_path), 'a').close()
    print(f"Imagen (placeholder) creada en: {image_repo_path}")

    # --- 2. Construir el HTML del post individual ---
    post_filename = f"{article_data['slug']}.html"
    post_repo_path = os.path.join('blog', post_filename)
    canonical_url = f"https://syntastudio.com/{post_repo_path.replace(os.path.sep, '/')}"
    
    faq_html = ""
    if article_data.get("faq_section"):
        for item in article_data["faq_section"]:
            faq_html += f"""<div class="border-t border-[var(--color-borde)] py-4"><h3 class="text-lg font-semibold text-[var(--color-texto-principal)]">{item['question']}</h3><p class="mt-2">{item['answer']}</p></div>"""

    schema_data = {
        "@context": "https://schema.org", "@type": "Article", "headline": article_data['title'],
        "author": {"@type": "Person", "name": "Napoleon Baca"}, "datePublished": datetime.now().strftime('%Y-%m-%d'),
        "image": f"https://syntastudio.com/public/images/{image_filename}", "description": article_data['meta_description'],
        "publisher": {"@type": "Organization", "name": "Synta Studio", "logo": {"@type": "ImageObject", "url": "https://i.imgur.com/vgnuj55.png"}},
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical_url}
    }
    if article_data.get("faq_section"):
        schema_data["mainEntity"] = {
            "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": qa["question"], "acceptedAnswer": {"@type": "Answer", "text": qa["answer"]}} for qa in article_data["faq_section"]]
        }
    
    with open(os.path.join(repo_path, 'templates/post_template.html'), 'r', encoding='utf-8') as f:
        template_str = f.read()

    post_html = template_str.replace('{{TITLE}}', article_data['title'])
    post_html = post_html.replace('{{META_DESCRIPTION}}', article_data['meta_description'])
    post_html = post_html.replace('{{CANONICAL_URL}}', canonical_url)
    post_html = post_html.replace('{{SCHEMA_JSON}}', json.dumps(schema_data, indent=4))
    post_html = post_html.replace('{{CATEGORY}}', article_data['category'])
    post_html = post_html.replace('{{AUTHOR}}', "Napoleon Baca")
    post_html = post_html.replace('{{DATE}}', datetime.now().strftime('%d de %B, %Y'))
    post_html = post_html.replace('{{READING_TIME}}', str(article_data['reading_time']))
    post_html = post_html.replace('{{IMAGE_URL}}', f'/public/images/{image_filename}')
    post_html = post_html.replace('{{IMAGE_ALT}}', article_data['image_alt'])
    post_html = post_html.replace('{{CONTENT_HTML}}', markdown2.markdown(article_data['content_markdown']))
    post_html = post_html.replace('{{FAQ_SECTION_HTML}}', faq_html)

    with open(os.path.join(repo_path, post_repo_path), 'w', encoding='utf-8') as f:
        f.write(post_html)
    print(f"Archivo de post generado: {post_repo_path}")

    # --- 3. Reconstruir el archivo principal del blog (blog.html) ---
    with open(os.path.join(repo_path, 'templates/blog_template.html'), 'r', encoding='utf-8') as f:
        blog_template_str = f.read()
    with open(os.path.join(repo_path, 'templates/post_card_template.html'), 'r', encoding='utf-8') as f:
        card_template_str = f.read()

    # Aquí iría una lógica más robusta para leer todos los posts y ordenarlos
    # Por ahora, solo añadimos el nuevo
    new_card_html = card_template_str.replace('{{POST_URL}}', f'/{post_repo_path}')
    new_card_html = new_card_html.replace('{{IMAGE_URL}}', f'/public/images/{image_filename}')
    new_card_html = new_card_html.replace('{{IMAGE_ALT}}', article_data['image_alt'])
    new_card_html = new_card_html.replace('{{CATEGORY_SLUG}}', slugify(article_data['category']))
    new_card_html = new_card_html.replace('{{CATEGORY_NAME}}', article_data['category'].upper())
    new_card_html = new_card_html.replace('{{TITLE}}', article_data['title'])

    # Reemplazar el placeholder en la plantilla del blog
    updated_blog_html = blog_template_str.replace('{{POST_CARDS_HTML}}', new_card_html) # En un sistema real, aquí se concatenarían todas las tarjetas
    
    with open(os.path.join(repo_path, 'blog.html'), 'w', encoding='utf-8') as f:
        f.write(updated_blog_html)
    print("Archivo blog.html actualizado.")

    # --- 4. Realizar el commit y push a una nueva rama ---
    try:
        repo.git.checkout('main')
        repo.git.pull()
        
        branch_name = f"content/{article_data['slug']}"
        if branch_name in repo.heads: # Evitar error si la rama ya existe
             repo.git.checkout(branch_name)
        else:
             repo.git.checkout('-b', branch_name)

        repo.index.add([post_repo_path, image_repo_path, 'blog.html'])
        
        author = Actor("Synta Content Bot", "bot@syntastudio.com")
        commit_message = f"feat(blog): Nuevo artículo '{article_data['title']}'"
        repo.index.commit(commit_message, author=author, committer=author)

        origin = repo.remote(name='origin')
        origin.push(refspec=f'HEAD:{branch_name}', force=True) # Usar force por si la rama ya existía
        
        print(f"Push a la rama '{branch_name}' exitoso. ¡Listo para crear la Pull Request!")
        repo.git.checkout('main')
    except Exception as e:
        print(f"Error durante el proceso de Git: {e}")