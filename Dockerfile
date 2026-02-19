# Use Node.js LTS version
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json only (not lock file, to resolve native bindings for Linux)
COPY package.json ./

# Install dependencies fresh for the target platform
RUN npm install --include=dev

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

# Sumo logo (clean URL)
COPY public/logo-sumo.png /usr/share/nginx/html/logo-sumo.png

# Copy Leños logo
COPY public/Logolenos.png /usr/share/nginx/html/Logolenos.png

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
