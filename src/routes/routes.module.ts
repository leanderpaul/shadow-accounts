/**
 * Importing npm packages
 */
import { Module, type ModuleMetadata, type Type } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { UserModule } from '@app/modules/user';
import { Config } from '@app/services';

import { AdminRouterModule } from './admin';
import { AuthRouterModule } from './auth';
import { DevModule } from './dev';
import { RouterController } from './router.controller';
import { UserRouterModule } from './user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const imports: Type<any>[] = [UserModule, AuthRouterModule, UserRouterModule, AdminRouterModule];

@Module({
  imports: RoutesModule.getImports(),
  controllers: [RouterController],
})
export class RoutesModule {
  static getImports(): ModuleMetadata['imports'] {
    if (Config.isDev()) imports.push(DevModule);
    return imports;
  }
}
