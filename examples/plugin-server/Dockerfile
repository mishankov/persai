FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose server port
EXPOSE 4444

# Run the server
CMD ["bun", "run", "src/server.ts"]
