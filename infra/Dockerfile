FROM node:24-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml ./
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine

COPY infra/nginx.conf.template /etc/nginx/conf.d/default.conf

# Копируем собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=6 \
    CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
