FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire application
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application with database migration
CMD ["sh", "-c", "pnpm db:push && pnpm start"]
