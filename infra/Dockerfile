FROM node:24-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8.15.8

COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set registry https://registry.npmjs.org/
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