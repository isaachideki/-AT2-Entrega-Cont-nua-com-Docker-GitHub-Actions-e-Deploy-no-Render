# ==============================================================================
# Estágio 1: build (compila o TypeScript para JavaScript em dist/)
# ==============================================================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copia só os manifestos primeiro: aproveita o cache de camadas do Docker
COPY package.json package-lock.json ./

# Instalação limpa e reprodutível (usa exatamente o que está no package-lock.json)
RUN npm ci

# Copia a configuração do TypeScript e o código-fonte
COPY tsconfig.json ./
COPY src ./src

# Gera a pasta dist/
RUN npm run build

# Remove as dependências de desenvolvimento, mantendo só as de produção
RUN npm prune --omit=dev

# ==============================================================================
# Estágio 2: imagem final de execução (enxuta, sem ferramentas de build)
# ==============================================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Porta padrão; no Render a variável PORT é definida pela própria plataforma
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Executa como usuário sem privilégios (já existe na imagem oficial do Node)
USER node

EXPOSE 3000

# Verificação de saúde do contêiner (o Render usa o Health Check Path configurado no painel)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

CMD ["node", "dist/server.js"]
