FROM node:24-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine

# Копируем шаблон конфига (не готовый конфиг!)
COPY infra/nginx.conf.template /etc/nginx/templates/default.conf.template

# Копируем entrypoint скрипт
COPY infra/deploy/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Копируем собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]