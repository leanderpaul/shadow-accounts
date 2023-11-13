/**
 * Importing npm packages
 */
import { type JSONData } from '@leanderpaul/shadow-service';
import { Controller, Get } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { DatabaseService } from '@app/modules/database';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Controller('dev')
export class DevController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('status')
  migrate(): JSONData {
    return { message: 'Server is running in development mode' };
  }

  @Get('test')
  async test(): Promise<JSONData> {
    const data = {};
    return { message: 'Test successful', data };
  }
}
