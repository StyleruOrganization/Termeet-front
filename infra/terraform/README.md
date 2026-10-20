# Инфраструктура Termeet

Terraform описывает одну ВМ Yandex Cloud и её сеть. Существующие workflows и скрипты деплоя приложений используются без изменений.

## Созданный сервер

| Параметр | Значение |
| --- | --- |
| Cloud | `b1g84g4c53oh2v83trse` |
| Folder | `b1g6au8sslbbuad995fo` |
| ВМ | `fv4hig3tbpa8t1si9ci3` |
| Зона | `ru-central1-d` |
| Статический IP | `178.154.209.138` |
| SSH-пользователь | `deploy` |
| Ресурсы | 2 vCPU, 4 ГБ RAM, SSD 40 ГБ |
| Диск | `fv4qt86jhq4idq6qca06` |
| Существующий Registry | `crpabro75r90q44npvtb` |
| Email для сертификатов | `kipabelousov@edu.hse.ru` |

```bash
ssh -i ~/.ssh/id_ed25519_termeet deploy@178.154.209.138
```

SSH fingerprint ED25519, сверенный с serial output облака: `SHA256:9u3YdXV+BYXE82DtTRHkd31FbNb0vJQ6TzOc7sq3ZPk`.

При создании увеличена квота SSD зоны D до 40 ГБ. Registry сохранился и подключён через data source: Terraform не управляет его жизненным циклом.

## Состав Terraform

Модуль `modules/docker-host` создаёт ВМ Ubuntu 24.04 LTS, отдельный загрузочный диск, сеть, подсеть, security group и статический IP. ВМ, диск и IP защищены `prevent_destroy`; диск не удаляется автоматически вместе с ВМ.

Cloud-init создаёт пользователя `deploy`, устанавливает Docker Engine и Compose, настраивает ротацию Docker-логов и запускает nginx-proxy с ACME companion. Пользователь имеет sudo и доступ к Docker. Снаружи открыты TCP 22, 80 и 443. Переменная `ssh_cidrs` позволяет ограничить SSH; по умолчанию он доступен для GitHub hosted runners с меняющимися IP.

## Управление

Команды выполняются из `infra/terraform`. Нужны Terraform 1.6+ и авторизованный `yc`.

```bash
export PATH="$HOME/yandex-cloud/bin:$PATH"
export TF_CLI_CONFIG_FILE="$PWD/terraform.rc"
export YC_TOKEN="$(yc iam create-token)"
terraform init -input=false
terraform plan -input=false -var-file=termeet.tfvars -out=termeet.tfplan
terraform apply -input=false termeet.tfplan
```

`terraform.rc` подключает официальное зеркало Yandex Cloud без изменения глобальных настроек. Локальный `termeet.tfvars` содержит ID, email и путь к публичному ключу. Приватный ключ и токен в Terraform не записываются.

**Сохраните `terraform.tfstate` в надёжном приватном месте.** State и `.tfvars` исключены из Git. Применение конфигурации без прежнего state может создать дубликаты ресурсов. Файл `.terraform.lock.hcl` следует хранить в репозитории.

## Nginx-proxy

Исходная конфигурация — `infra/nginx-proxy/compose.yml`, на сервере — `/opt/termeet/proxy/compose.yml`. Proxy и приложения используют сеть `nginx-proxy`, которую уже ожидают существующие скрипты деплоя.

Для динамического роутинга приложения передают `VIRTUAL_HOST`, `VIRTUAL_PORT`, `LETSENCRYPT_HOST` и `LETSENCRYPT_EMAIL`. Установленная версия ACME companion поддерживает эти прежние переменные. Сертификаты и состояние ACME сохраняются в Docker volumes.

Cloud-init завершился без ошибок, контейнеры `nginx-proxy` и `nginx-proxy-acme` запущены. Сертификат для домена выпускается после запуска приложения и настройки его DNS на новый IP.

Cloud-init выполняет установку при первом запуске ВМ. Для обновления конфигурации proxy скопируйте актуальные `compose.yml` и `proxy.conf` в `/opt/termeet/proxy/`, затем выполните на сервере:

```bash
sudo systemctl restart termeet-proxy
```

## Подключение существующего деплоя

В GitHub Secrets обновите `SERVER_HOST=178.154.209.138`, `SERVER_USER=deploy` и `SSH_PRIVATE_KEY`, соответствующий `~/.ssh/id_ed25519_termeet.pub`. Сохраняются прежние `CONTAINER_REGISTRY=crpabro75r90q44npvtb`, `Y_TOKEN` и `EMAIL=kipabelousov@edu.hse.ru`. Новый secret для существующих workflows не требуется.

A-записи `termeet-dev.ru`, `*.termeet-dev.ru` и `termeet.tech` должны указывать на `178.154.209.138`. DNS и GitHub Secrets в рамках создания ВМ не изменялись.

По исходной конфигурации preprod разворачивается из `main`, PR получает отдельный стенд, production запускается вручную и собирается на сервере. При изучении обнаружены вопросы для отдельной правки:

- Preview собирается без `-f infra/Dockerfile` и не передаёт контейнеру переменные бэкенда.
- Production healthcheck использует `curl`, который Dockerfile явно не устанавливает.
- В сохранённом backend Compose для PostgreSQL 17 production volume смонтирован в `/var/lib/postgresql`, тогда как каталог данных образа — `/var/lib/postgresql/data`.

Эти места не изменены при восстановлении инфраструктуры.

Registry содержит образы приложений, но не данные PostgreSQL/MinIO и не прежние `.env`. До создания новой ВМ в указанном folder не обнаружено старых ВМ, дисков и snapshots. Для восстановления бэкенда нужны секреты и внешние резервные копии данных. Workflows в `back/.github/workflows` относятся к backend-репозиторию и автоматически из фронтенд-репозитория не запускаются.
