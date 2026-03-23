Traducciones del admin (español, etc.).

Para compilar los mensajes y que el admin muestre español cuando el navegador
o la sesión estén en español, instala GNU gettext (en Windows: por ejemplo
desde https://mlocati.github.io/articles/gettext-iconv-windows.html) y ejecuta:

  python manage.py compilemessages -l es

Esto genera el archivo .mo desde .po. El idioma del admin sigue al del
navegador (Accept-Language) o a la sesión (LocaleMiddleware está activo).
