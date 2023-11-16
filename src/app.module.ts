/**
 * Importing npm packages
 */
import { Module, type OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Importing user defined packages
 */
import { RoutesModule } from './routes';
import { Logger } from './services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const RateLimiterModule = ThrottlerModule.forRoot([{ limit: 10, ttl: 30 }]);

@Module({
  imports: [RateLimiterModule, RoutesModule],
  providers: [],
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(): void {
    Logger.close();
  }
}
