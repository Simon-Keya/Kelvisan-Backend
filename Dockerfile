# 1. Base image for the build stage
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files and tsconfig.json
COPY package*.json ./
COPY tsconfig.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy application code
COPY src ./src

# 6. Run TypeScript build
RUN npm exec tsc --pretty --force --diagnostics

# 7. Production stage
FROM node:18-alpine AS production

# 8. Set working directory
WORKDIR /usr/src/app

# 9. Set production environment
ENV NODE_ENV=production

# 10. Copy necessary files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/docs ./docs
COPY --from=builder /usr/src/app/src/database/migrations ./src/database/migrations

# 11. Expose port
EXPOSE 5000

# 12. Start command
CMD ["npm", "run", "start:migrate"]