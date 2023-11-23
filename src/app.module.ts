/**
 * Importing npm packages
 */
import { Module, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Importing user defined packages
 */
import { AuthService } from './modules/auth';
import { RoutesModule } from './routes';
import { Logger, Middleware } from './services';

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
export class AppModule implements OnApplicationShutdown, OnModuleInit {
  onModuleInit(): void {
    Middleware.add({ handler: (_req, _res, app) => app.get(AuthService).authenticate() });
  }

  onApplicationShutdown(): void {
    Logger.close();
  }
}
