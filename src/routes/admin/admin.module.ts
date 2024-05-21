/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { UserModule } from '@app/modules/user';

import { AdminController } from './admin.controller';
import { AppServiceController } from './app-service.controller';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [UserModule],
  controllers: [AdminController, AppServiceController],
})
export class AdminRouterModule {}
