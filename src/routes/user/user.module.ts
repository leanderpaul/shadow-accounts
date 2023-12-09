/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { UserModule } from '@app/modules/user';

import { UserEmailController } from './user-email.controller';
import { UserController } from './user.controller';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [UserModule],
  controllers: [UserController, UserEmailController],
})
export class UserRouterModule {}
