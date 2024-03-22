# Installing the required tools in production build
FROM oven/bun:1.0.33-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Setting up the environment variables
ENV PORT 8080
ENV NODE_ENV production
ENV DOMAIN shadow-apps.com

# Setting the working directory and user
USER bun
WORKDIR /home/bun/app

# Copying the built files
COPY dist .

# Running the application
EXPOSE 8080
CMD ["dumb-init", "bun", "run", "src/main.ts"]