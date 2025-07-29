# 1. Base image for the build stage
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files, tsconfig.json, source code, and docs
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY docs ./docs

# 4. Install all dependencies (including devDependencies for build)
RUN npm install

# 5. Run TypeScript build
RUN npm exec tsc --pretty --force --diagnostics

# 6. Production stage
FROM node:18-alpine AS production

# 7. Set working directory
WORKDIR /usr/src/app

# 8. Set production environment
ENV NODE_ENV=production

# 9. Copy package files and install production dependencies
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --production --ignore-scripts

# 10. Copy built files, docs, and migrations
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/docs ./docs
COPY --from=builder /usr/src/app/src/database/migrations ./src/database/migrations

# 11. Expose port
EXPOSE 5000

# 12. Start command
CMD ["npm", "run", "start:migrate"]