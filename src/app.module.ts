/**
 * Importing npm packages
 */
import { Module, type OnApplicationShutdown } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Importing user defined packages
 */
import { ErrorFilter } from './errors';
import { RoutesModule } from './routes';
import { Logger } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const GlobalErrorFilter = { provide: APP_FILTER, useClass: ErrorFilter };
const RateLimiterModule = ThrottlerModule.forRoot([{ limit: 10, ttl: 30 }]);

@Module({
  imports: [RateLimiterModule, RoutesModule],
  providers: [GlobalErrorFilter],
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(): void {
    Logger.close();
  }
}
