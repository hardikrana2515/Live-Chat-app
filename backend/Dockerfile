# Multi-stage optimized Node.js runtime for Talkyy Backend
FROM node:20-alpine AS runner

# Install build dependencies required for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Cache package installation
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy backend source code
COPY . .

# Ensure storage directories for uploaded media & avatars exist
RUN mkdir -p public/Image public/media

# Expose backend port
EXPOSE 4000

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Start backend server
CMD ["node", "server.js"]
