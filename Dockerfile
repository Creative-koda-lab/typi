# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
