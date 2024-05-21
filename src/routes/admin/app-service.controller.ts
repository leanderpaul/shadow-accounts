/**
 * Importing npm packages
 */
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AccessGuard } from '@app/decorators';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('App Service')
@Controller('admin/app-services')
@AccessGuard()
export class AppServiceController {}
