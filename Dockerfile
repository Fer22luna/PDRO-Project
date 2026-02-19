########## Dockerfile multi-stage para producción ##########
# Imagen base: Node 20 (slim)
FROM node:20-slim AS builder

# Directorio de trabajo
WORKDIR /app

# Build args para variables públicas que deben existir al momento del build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Copiamos package-lock primero para aprovechar cache de docker
COPY package.json package-lock.json ./

# Instalamos dependencias (dev + prod) necesarias para el build
RUN npm ci

# Copiamos el resto del proyecto y construimos
COPY . .
RUN npm run build

# Eliminamos dependencias de desarrollo para aligerar la imagen final
RUN npm prune --production


########## Runner final ##########
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Repetimos ARG/ENV por si se necesitan en runtime (opcional para NEXT_PUBLIC_)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Copiamos artefactos de build y node_modules (ya pruned)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Ejecuta la app en modo producción
CMD ["npm","start"]
