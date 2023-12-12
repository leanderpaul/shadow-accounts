/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { AuthModule } from '@app/modules/auth';
import { UserModule } from '@app/modules/user';

import { AuthController } from './auth.controller';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AuthController],
})
export class AuthRouterModule {}
