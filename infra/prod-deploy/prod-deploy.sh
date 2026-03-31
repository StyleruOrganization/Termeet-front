#!/bin/bash

set -e

cd "$(dirname "$0")"

# Проверяем состояние контейнера
if docker compose ps termeet-blue --format json 2>/dev/null | grep -q '"Status": "healthy"'; then
    export NEW="green"
    export OLD="blue"
else
    export NEW="blue"
    export OLD="green"
fi

echo "Поднимаю проект с профилем ${NEW}"

# Запускаем новый контейнер
docker compose \
    --profile ${NEW} \
    up \
    --detach \
    --build \
    --remove-orphans \
    --wait \
    --quiet-pull

# Останавливаем и удаляем старый, если есть
if [ -n "${OLD}" ]; then
    echo "Останавливаю сервисы ${OLD}"
    docker compose stop termeet-${OLD} 2>/dev/null || true
    
    echo "Удаляю сервисы ${OLD}"
    docker compose rm -f termeet-${OLD} 2>/dev/null || true
fi

echo "Список контейнеров"
docker compose ps -a

echo "Журналы запуска termeet-${NEW}"
docker compose logs termeet-${NEW} --tail 30