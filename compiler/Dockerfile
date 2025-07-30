# Use official Node.js runtime as base image
FROM node:20-alpine

# Install build dependencies for C++ compilation
RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    openjdk11

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p codes output logs && \
    chmod 755 codes output logs

# Expose port
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S compiler -u 1001 -G nodejs && \
    chown -R compiler:nodejs /app

USER compiler

# Start the application
CMD ["npm", "start"]
