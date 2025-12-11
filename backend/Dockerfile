# Build stage
FROM node:20-alpine AS builder

WORKDIR /app


COPY package.json ./
COPY package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

COPY backend/tsconfig.json ./

COPY backend/src ./src/COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci --omit=dev && npm install prisma --save-dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD sh -c "npx prisma migrate deploy && node dist/index.js"