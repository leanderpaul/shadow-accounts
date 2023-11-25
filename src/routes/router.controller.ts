/**
 * Importing npm packages
 */
import { Controller, Get, Render } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { AuthType, UseAuthGuard } from '@app/guards';
import { type TemplateData } from '@app/interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Controller()
export class RouterController {
  @Get()
  @Render('home')
  @UseAuthGuard(AuthType.AUTHENTICATED)
  getHomePage(): TemplateData {
    return {
      title: 'Home',
      description: 'Manage your Shadow account',
      styles: ['main'],
      scripts: ['jquery'],
    };
  }
}
