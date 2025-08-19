# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    redis \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY database.json ./

# ========================================
# STAGE 1: Dependências
# ========================================
FROM base AS deps

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# ========================================
# STAGE 2: Build do Frontend
# ========================================
FROM base AS frontend-builder

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte do frontend
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY tsconfig*.json ./
COPY postcss.config.js ./

# Build do frontend
RUN npm run build:frontend

# ========================================
# STAGE 3: Build do Backend
# ========================================
FROM base AS backend-builder

# Instalar dependências
RUN npm ci

# Copiar código fonte do backend
COPY backend/ ./backend/
COPY migrations/ ./migrations/
COPY scripts/ ./scripts/

# Criar diretórios necessários
RUN mkdir -p logs uploads

# ========================================
# STAGE 4: Produção
# ========================================
FROM node:18-alpine AS production

# Instalar dependências de produção
RUN apk add --no-cache \
    postgresql-client \
    redis \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências de produção
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/database.json ./

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist

# Copiar código do backend
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /app/migrations ./migrations
COPY --from=backend-builder /app/scripts ./scripts

# Criar diretórios necessários
RUN mkdir -p logs uploads && chown -R nextjs:nodejs /app

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["npm", "start:backend"]

# ========================================
# STAGE 5: Desenvolvimento
# ========================================
FROM base AS development

# Instalar todas as dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs uploads

# Expor portas
EXPOSE 3000 3001 5173

# Comando de desenvolvimento
CMD ["npm", "run", "dev"]

# ========================================
# STAGE 6: Testes
# ========================================
FROM base AS test

# Instalar todas as dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs uploads

# Comando de testes
CMD ["npm", "test"]

# ========================================
# STAGE 7: CI/CD
# ========================================
FROM base AS ci

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs uploads

# Scripts de CI
COPY .github/scripts/ ./scripts/

# Comando de CI
CMD ["npm", "run", "ci"]