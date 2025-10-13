FROM denoland/deno:1.38.3

# Set working directory
WORKDIR /app

# Copy dependency files
COPY deno.json ./

# Copy source code
COPY server.ts ./
COPY public/ ./public/

# Cache dependencies
RUN deno cache server.ts

# Expose port
EXPOSE 8000

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]