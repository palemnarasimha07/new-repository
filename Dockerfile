# Multi-Stage Dockerfile for NCC Digital Cadet System
# Option B: Unified Single-Container Cloud Run Deployment

# ==============================================================================
# Stage 1: Build Frontend SPA
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependency manifests and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source files and build production static bundle (dist)
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Express Backend + Static Assets Runner
# ==============================================================================
FROM node:20-alpine AS runner

# Production environment settings
ENV NODE_ENV=production
ENV PORT=8080

# Setup backend workspace
WORKDIR /app/backend

# Copy backend dependency manifests and install production dependencies only
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy built frontend static bundle from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose default Cloud Run port
EXPOSE 8080

# Start Express backend server
CMD ["node", "server.js"]
