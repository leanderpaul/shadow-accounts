/**
 * Importing npm packages
 */
import { Module, type ModuleMetadata } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { Config } from '@app/services';

import { DevModule } from './dev';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: RoutesModule.getImports(),
})
export class RoutesModule {
  static getImports(): ModuleMetadata['imports'] {
    const imports: ModuleMetadata['imports'] = [];
    if (Config.isDev()) imports.push(DevModule);
    return imports;
  }
}
