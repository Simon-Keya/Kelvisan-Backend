# 1. Base image for the build stage (where TypeScript is compiled)
FROM node:18-alpine AS builder

# 2. Set working directory for the builder stage
WORKDIR /usr/src/app

# 3. Copy package files to leverage Docker's build cache
COPY package*.json ./

# 4. Install ALL dependencies (including devDependencies needed for 'npm run build')
RUN npm install

# 5. Copy the rest of your application source code
#    Make sure your .dockerignore excludes node_modules and dist here
COPY . .

# *** DIAGNOSTIC STEPS - ADDED ***
# List files to confirm package.json and tsconfig.json are there
RUN ls -la /usr/src/app/

# List contents of src directory to ensure source files are copied
RUN ls -la /usr/src/app/src/

# Verify tsconfig.json content (optional, but can be useful)
RUN cat /usr/src/app/tsconfig.json
# ********************************

# 6. Run the TypeScript build command directly with verbose output
#    We'll explicitly call tsc to get its full output if it fails
#    Also, removing postinstall from package.json *temporarily* is advised for this debugging step.
RUN tsc --pretty --force --diagnostics || true # Added '|| true' to prevent this step from failing the build immediately, so we can see other errors if they exist.

# ---------------------------------------------------

# 7. Use a smaller, production-ready image for the final stage
FROM node:18-alpine AS production

# 8. Set working directory for the production stage
WORKDIR /usr/src/app

# 9. Set production environment variable
ENV NODE_ENV=production

# 10. Copy ONLY necessary files from the builder stage to the production stage
#     This is the CRUCIAL step to get your compiled 'dist' folder and production dependencies
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# 11. Copy any other files needed directly in production (e.g., static assets, swagger YAML)
#     If .env is sensitive, do NOT copy it into the Docker image. Use Render's environment variables.
# COPY .env ./ # REMOVE THIS - USE RENDER ENVIRONMENT VARIABLES
# COPY swagger.yaml ./ # If this is in your project root and is needed by the running app

# 12. Expose the port (optional, but good practice; Render uses process.env.PORT)
EXPOSE 5000

# 13. Define the command to start the server
CMD ["node", "dist/server.js"]