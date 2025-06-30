# 1. Base image
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production=false

# 4. Copy rest of app
COPY . .

# 5. Build TypeScript
RUN npm run build

# ---------------------------------------------------

# 6. Use smaller image for production
FROM node:18-alpine AS production

# 7. Set environment 
ENV NODE_ENV=production



# 9. Expose port (optional for local docker run, not needed on Render)
EXPOSE 5000

# 10. Start the server
CMD ["node", "dist/server.js"]
