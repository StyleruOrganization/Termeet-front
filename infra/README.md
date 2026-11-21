# Развёртывание frontend

Frontend собирается на общем Docker-сервере из `infra/Dockerfile`.
Nginx внутри образа отдаёт SPA; внешний Traefik обслуживает HTTPS,
направляет `/api` в backend, а `/telegram/webhook` — в Telegram-бот.

Контроллер, Compose постоянных компонентов, мониторинг, конфигурация
проектов и центральные workflows перенесены в отдельный репозиторий
[infra](https://github.com/StyleruOrganization/infra).
Локально репозитории расположены в соседних папках
`frontend`, `backend`, `bot` и `infra`.

Релиз запускается в Actions инфра-репозитория:
`Release service`, project `termeet`, service `frontend`,
ref — ветка, тег или SHA приложения. GitHub runner не собирает
и не публикует Docker-образ. Сервер сам получает нужный код,
строит кандидата, проверяет `/health` и переключает маршрут.

Frontend использует относительный `/api`; production-секретов у него нет.
Backend и бот получают env автоматически из SOPS в инфра-репозитории.
Старые app release workflows и `infra/server` удалены.
Прежние Terraform и nginx-proxy удалены из репозитория.
