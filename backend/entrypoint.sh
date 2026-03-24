#!/bin/sh
set -eu

echo "Running migrations..."
python manage.py migrate

RAW_FLAG="${CREATE_BOOTSTRAP_ADMIN:-}"
BOOTSTRAP_FLAG="$(printf '%s' "$RAW_FLAG" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
echo "CREATE_BOOTSTRAP_ADMIN(raw)='$RAW_FLAG'"
echo "CREATE_BOOTSTRAP_ADMIN(normalized)='$BOOTSTRAP_FLAG'"

if [ "$BOOTSTRAP_FLAG" = "true" ] || [ "$BOOTSTRAP_FLAG" = "1" ] || [ "$BOOTSTRAP_FLAG" = "yes" ]; then
  python manage.py shell -c "import os; from django.contrib.auth import get_user_model; U=get_user_model(); u=os.getenv('DJANGO_SUPERUSER_USERNAME'); e=os.getenv('DJANGO_SUPERUSER_EMAIL'); p=os.getenv('DJANGO_SUPERUSER_PASSWORD'); assert u and p, 'DJANGO_SUPERUSER_USERNAME and DJANGO_SUPERUSER_PASSWORD are required when CREATE_BOOTSTRAP_ADMIN is enabled'; obj,_=U.objects.get_or_create(username=u, defaults={'email': e or ''}); obj.email=e or obj.email; obj.is_staff=True; obj.is_superuser=True; obj.is_active=True; obj.role='ADMIN'; obj.set_password(p); obj.save(); print('bootstrap admin ready')"
else
  echo "bootstrap admin skipped"
fi

PORT="${PORT:-8080}"
echo "Starting gunicorn on port ${PORT}..."
exec gunicorn portfolio_api.wsgi:application --bind "0.0.0.0:${PORT}"
