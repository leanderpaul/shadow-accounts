/**
 * Importing npm packages
 */
import path from 'node:path';

import { fastifyCookie } from '@fastify/cookie';
import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import handlebars from 'handlebars';

/**
 * Importing user defined packages
 */
import { AppModule } from './app.module';
import { ErrorFilter } from './errors';
import { ValidationPipe } from './pipes';
import { Config, Logger, Middleware } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

async function bootstrap() {
  const logger = Logger.getNestLogger('Nest');
  const publicDir = path.join(import.meta.dir, '..', 'public');
  const templateDir = path.join(import.meta.dir, '..', 'views');

  /** Creating fasitfy instance and registering plugins */
  const adapter = new FastifyAdapter();
  const instance = adapter.getInstance();
  await instance.register(fastifyCookie);
  /**
   * Disabling the compression plugin as it is `BrotliCompress` and `createBrotliCompress`
   * are not yet supported by bun. and the other encoding result in an error in dependency package `stream-shift`.
   * Add compression after these methods are implemented or the bug in package is fixed.
   */
  // await instance.register(compression, { encodings: ['deflate'] });

  /** Configuring the nestjs application */
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { logger });
  Middleware.init(app);
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets({ root: publicDir });
  app.setViewEngine({ engine: { handlebars }, templates: templateDir, includeViewExtension: true, layout: 'layout' });
  app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGUSR2, ShutdownSignal.SIGTERM]);

  /** Configuring the swagger */
  if (Config.isDev()) {
    const cookieName = Config.get('cookie.name');
    const config = new DocumentBuilder().setTitle('Shadow Accounts API').addCookieAuth(cookieName).build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('dev/api-docs', app, document);
  }

  /** Starting the nestjs application */
  const port = Config.get('app.port');
  const hostname = Config.get('app.hostname');
  await app.listen(port, hostname);
}

bootstrap();
