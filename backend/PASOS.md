# Pasos para levantar el backend (Django)

Ejecuta estos comandos **en orden** en la terminal, desde la carpeta del backend.

---

## 1. Ir a la carpeta del backend

```powershell
cd c:\Users\giuli\OneDrive\Escritorio\PROYECTOS\portfolio\backend
```

---

## 2. Activar el entorno virtual

```powershell
.\.venv\Scripts\Activate.ps1
```

Verás `(.venv)` al inicio de la línea cuando esté activado.

---

## 3. Instalar dependencias (solo si cambiaste requirements o recreaste el venv)

```powershell
pip install -r requirements.txt
```

Si ya lo hiciste antes y no tocaste `requirements.txt`, puedes **saltar este paso**.

---

## 4. Aplicar migraciones (crear tablas en la base de datos)

```powershell
python manage.py migrate
```

Necesitas tener PostgreSQL corriendo y el archivo `.env` con `DATABASE_URL` configurado (ver README del backend).

---

## 5. Crear usuario administrador (solo la primera vez)

```powershell
python manage.py createsuperuser
```

Te pedirá nombre de usuario, email y contraseña. Con ese usuario entras al admin.

---

## 6. Arrancar el servidor

```powershell
python manage.py runserver
```

El backend quedará en **http://127.0.0.1:8000/**  
El admin en **http://127.0.0.1:8000/admin/**

---

## Resumen rápido (si ya tienes todo instalado y la base creada)

```powershell
cd c:\Users\giuli\OneDrive\Escritorio\PROYECTOS\portfolio\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

Luego abre el navegador en http://127.0.0.1:8000/admin/ e inicia sesión con el superuser.
