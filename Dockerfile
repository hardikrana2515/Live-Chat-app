# Multi-stage full-stack Dockerfile for Talkyy
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Serve
FROM node:20-alpine AS runner
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY backend/ ./

# Copy built frontend assets into backend public directory
COPY --from=frontend-builder /app/frontend/dist ./public/dist

RUN mkdir -p public/Image public/media

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "server.js"]
