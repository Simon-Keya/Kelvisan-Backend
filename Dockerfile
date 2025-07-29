# 1. Base image for the build stage
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files, tsconfig.json, and source code
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# 4. Install dependencies
RUN npm install

# 5. Run TypeScript build
RUN npm exec tsc --pretty --force --diagnostics

# 6. Production stage
FROM node:18-alpine AS production

# 7. Set working directory
WORKDIR /usr/src/app

# 8. Set production environment
ENV NODE_ENV=production

# 9. Copy necessary files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/docs ./docs
COPY --from=builder /usr/src/app/src/database/migrations ./src/database/migrations

# 10. Expose port
EXPOSE 5000

# 11. Start command
CMD ["npm", "run", "start:migrate"]