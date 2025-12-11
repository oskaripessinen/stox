FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY backend/package.json ./backend/

COPY backend/prisma ./backend/prisma/

RUN npm ci
RUN npm install @prisma/client --no-save

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --schema=./backend/prisma/schema.prisma

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src/

RUN npm run build --prefix backend

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm install prisma --save-dev

COPY --from=builder /app/backend/dist ./dist

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3001

CMD sh -c "npx prisma migrate deploy && node dist/index.js"