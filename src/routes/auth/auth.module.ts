/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { AuthModule } from '@app/modules/auth';

import { AuthController } from './auth.controller';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class AuthRouterModule {}
