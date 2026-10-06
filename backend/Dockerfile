# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for TS compilation)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy built code from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root user for security
RUN addgroup -S siimsgroup && adduser -S siimsuser -G siimsgroup
USER siimsuser

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
