/**
 * Importing npm packages
 */
import path from 'node:path';

import compression from '@fastify/compress';
import { fastifyCookie } from '@fastify/cookie';
import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import handlebars from 'handlebars';

/**
 * Importing user defined packages
 */
import { AppModule } from './app.module';
import { Config, Logger, Middleware } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

async function bootstrap() {
  const logger = Logger.getNestLogger('Nest');
  const publicDir = path.join(__dirname, '..', 'public');
  const templateDir = path.join(__dirname, '..', 'views');

  /** Creating fasitfy instance and registering plugins */
  const adapter = new FastifyAdapter();
  const instance = adapter.getInstance();
  await instance.register(fastifyCookie);
  await instance.register(compression);

  /** Configuring the nestjs application */
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { logger });
  Middleware.init(app);
  app.useStaticAssets({ root: publicDir });
  app.setViewEngine({ engine: { handlebars }, templates: templateDir });
  app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGUSR2, ShutdownSignal.SIGTERM]);

  /** Starting the nestjs application */
  const port = Config.get('app.port');
  const hostname = Config.get('app.hostname');
  await app.listen(port, hostname);
}

bootstrap();
