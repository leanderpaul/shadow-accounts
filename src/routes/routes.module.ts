/**
 * Importing npm packages
 */
import { Module, type ModuleMetadata, type Type } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { Config } from '@app/services';

import { AuthRouterModule } from './auth';
import { DevModule } from './dev';
import { RouterController } from './router.controller';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const imports: Type<any>[] = [AuthRouterModule];

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
