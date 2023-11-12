/**
 * Importing npm packages
 */
import { type Logger as LoggerInstance, LoggerService } from '@leanderpaul/shadow-service';
import { type LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { type MiddlewareCallback } from '@app/interfaces';

import { Context } from './context.service';

/**
 * Defining types
 */

export interface RequestMetadata {
  /** request id */
  rid?: string;
  /** Service request id */
  srid?: string;
  method?: string;
  url?: string;
  status?: number;
  reqLen?: string;
  reqIp?: string;
  resLen?: string;
  /** Time taken to process the request */
  timeTaken?: string;
  body?: any;
  query?: object;
  [key: string]: any;
}

declare module 'fastify' {
  interface FastifyRequest {
    startTime: [number, number];
  }
}

/**
 * Declaring the constants
 */
const sensitiveFields = ['password'];

export class Logger implements NestLoggerService {
  private readonly instance: LoggerInstance;

  private constructor(label: string) {
    this.instance = Logger.getLogger(label);
  }

  static getLogger(input: string): LoggerInstance {
    return LoggerService.getInstance().child({ label: input });
  }

  static getNestLogger(input: string): Logger {
    return new Logger(input);
  }

  static getRequestStartHandler(): MiddlewareCallback {
    return (req, _res, done) => {
      req.startTime = process.hrtime();
      return done();
    };
  }

  static getRequestEndHandler(): MiddlewareCallback {
    return (req, res, done) => {
      const isLoggingDisabled = Context.get<boolean>('DISABLE_REQUEST_LOGGING') ?? false;
      if (isLoggingDisabled) return done();

      const metadata: RequestMetadata = {};
      metadata.rid = Context.getRID();
      metadata.url = req.url;
      metadata.method = req.method;
      metadata.status = res.statusCode;
      metadata.service = req.headers['x-shadow-service'] as string;
      metadata.reqLen = req.headers['content-length'];
      metadata.reqIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      metadata.resLen = res.getHeader('content-length') as string;
      const resTime = process.hrtime(req.startTime);
      metadata.timeTaken = (resTime[0] * 1e3 + resTime[1] * 1e-6).toFixed(3); // Converting time to milliseconds
      if (req.query) metadata.query = req.query;
      if (req.body) metadata.body = LoggerService.removeSensitiveFields(req.body, sensitiveFields);
      LoggerService.getInstance().http('http', metadata);
      return done();
    };
  }

  static close(): void {
    LoggerService.getInstance().close();
  }

  log(message: string, label?: string): void {
    this.instance.info(message, { label });
  }

  error(message: string, trace?: string, label?: string): void {
    this.instance.error(trace || message, { trace, label, msg: message });
  }

  warn(message: string, label?: string): void {
    this.instance.warn(message, { label });
  }

  debug(message: string, label?: string): void {
    this.instance.debug(message, { label });
  }

  verbose(message: string, label?: string): void {
    this.instance.verbose(message, { label });
  }
}
