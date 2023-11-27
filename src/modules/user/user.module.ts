/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { DatabaseModule } from '@app/modules/database';
import { MailService } from '@app/services';

import { UserService } from './user.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [DatabaseModule],
  providers: [UserService, MailService],
  exports: [UserService],
})
export class UserModule {}
