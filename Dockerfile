# Setting up the build stage
FROM oven/bun:1.0.33-slim AS build
WORKDIR /home/shadow/build

# Copying the required files to build the application
COPY src src
COPY views views
COPY public public
COPY scripts scripts
COPY bun.lockb bunfig.toml package.json tailwind.config.js tsconfig.json .

# Installing and building the application
RUN bun install
RUN bun run build

# Installing the required tools in production build
FROM oven/bun:1.0.33-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Setting up the environment variables
ENV PORT 8080
ENV NODE_ENV production
ENV DOMAIN shadow-apps.com

# Setting the working directory and user
USER shadow
WORKDIR /home/shadow/app

# Copying the files required
COPY --chown=shadow:shadow --from=build /home/shadow/build/dist .

# Installing the npm packages requried
RUN bun install --frozen-lockfile --production

# Running the application
EXPOSE 8080
CMD ["dumb-init", "bun", "run", "src/main.ts"]