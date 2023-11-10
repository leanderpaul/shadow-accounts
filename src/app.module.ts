/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Importing user defined packages
 */
import { RoutesModule } from './routes';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const RateLimiterModule = ThrottlerModule.forRoot([{ limit: 10, ttl: 30 }]);

@Module({
  imports: [RateLimiterModule, RoutesModule],
})
export class AppModule {}
