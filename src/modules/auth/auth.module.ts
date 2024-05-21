/**
 * Importing npm packages
 */

import { Module } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { DatabaseModule } from '@app/modules/database';
import { SystemModule } from '@app/modules/system';
import { UserModule } from '@app/modules/user';

import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { UserAuthService } from './user-auth.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [DatabaseModule, UserModule, SystemModule],
  providers: [AuthService, CookieService, UserAuthService],
  exports: [AuthService, UserAuthService],
})
export class AuthModule {}
