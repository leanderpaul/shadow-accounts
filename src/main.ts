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

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const publicDir = path.join(__dirname, '..', 'public');
const templateDir = path.join(__dirname, '..', 'views');

async function bootstrap() {
  const adapter = new FastifyAdapter();
  const instance = adapter.getInstance();

  /** Registering fastify plugins */
  await instance.register(fastifyCookie);
  await instance.register(compression);

  /** Configuring the nestjs application */
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  app.useStaticAssets({ root: publicDir });
  app.setViewEngine({ engine: { handlebars }, templates: templateDir });
  app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGUSR2, ShutdownSignal.SIGTERM]);

  await app.listen(8080);
}

bootstrap();
