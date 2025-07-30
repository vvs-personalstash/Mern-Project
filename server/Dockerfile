# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs

# Expose port
EXPOSE 5001

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S server -u 1001
USER server

# Start the application
CMD ["npm", "start"]
