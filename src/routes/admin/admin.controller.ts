/**
 * Importing npm packages
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AccessGuard, RenderView } from '@app/decorators';
import { type TemplateData } from '@app/interfaces';
import { Template } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('Admin')
@Controller('admin')
@AccessGuard()
export class AdminController {
  constructor() {}

  @Get()
  @RenderView()
  getAdminPage(): TemplateData {
    return {
      title: 'Admin dashboard',
      description: 'Admin dashboard',
      layout: Template.getSPALayout('admin'),
      template: 'admin/dashboard',
    };
  }
}
