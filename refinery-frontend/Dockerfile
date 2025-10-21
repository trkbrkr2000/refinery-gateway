# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Nuxt app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Set production environment
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the Nuxt server
CMD ["node", ".output/server/index.mjs"]
