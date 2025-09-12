# Use Node.js LTS version
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy logo to nginx html folder
COPY public/bandidos.png /usr/share/nginx/html/bandidos.png

# Ensure Sumo logo with spaces is present (domain-based logo)
COPY ["public/Logo sumo PNG si fondo .png", "/usr/share/nginx/html/Logo sumo PNG si fondo .png"]

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
