#!/bin/sh
set -e

echo "=== Starting nginx with env variables ==="
echo "BACKEND_PORT: ${BACKEND_PORT}"
echo "BACKEND_HOST: ${BACKEND_HOST}"
echo "BACKEND_CONTAINER: ${BACKEND_CONTAINER}"
echo "VIRTUAL_HOST: ${VIRTUAL_HOST}"
echo "========================================="

# Заменяем переменные в шаблоне
envsubst '${BACKEND_CONTAINER} ${BACKEND_PORT} ${BACKEND_HOST}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Показываем сгенерированный конфиг (для отладки)
echo "=== Generated nginx config ==="
cat /etc/nginx/conf.d/default.conf
echo "================================"

# Проверяем конфиг
nginx -t

# Запускаем nginx
exec nginx -g 'daemon off;'