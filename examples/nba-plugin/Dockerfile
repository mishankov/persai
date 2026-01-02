FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Run server
CMD ["bun", "run", "server.ts"]
