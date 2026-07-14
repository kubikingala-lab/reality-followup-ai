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

# Start the application (migration runs first, but server starts even if migration fails)
CMD ["sh", "-c", "pnpm db:push || echo 'Migration failed, starting anyway' && pnpm start"]
