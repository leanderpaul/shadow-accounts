/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { DatabaseModule } from '@app/modules/database';
import { SystemModule } from '@app/modules/system';
import { MailService } from '@app/services';

import { ServiceAccountService } from './service-account.service';
import { UserEmailService } from './user-email.service';
import { UserService } from './user.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [DatabaseModule, SystemModule],
  providers: [UserService, MailService, UserEmailService, ServiceAccountService],
  exports: [UserService, UserEmailService, ServiceAccountService],
})
export class UserModule {}
