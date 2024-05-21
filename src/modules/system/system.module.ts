/**
 * Importing npm packages
 */
import { Module, type OnModuleInit } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { DatabaseModule } from '@app/modules/database';

import { AppServiceService } from './app-service.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [DatabaseModule],
  providers: [AppServiceService],
  exports: [AppServiceService],
})
export class SystemModule implements OnModuleInit {
  constructor(private readonly appServiceService: AppServiceService) {}

  async onModuleInit(): Promise<void> {
    await this.appServiceService.loadServices();
  }
}
