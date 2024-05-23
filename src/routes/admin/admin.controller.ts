/**
 * Importing npm packages
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AccessGuard, IAMRoles, RenderView } from '@app/decorators';
import { type TemplateData } from '@app/interfaces';
import { UserService } from '@app/modules/user';
import { Template } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('Admin')
@Controller('admin')
@AccessGuard({ requiredRole: IAMRoles.Admin })
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RenderView()
  async getAdminDashboardPage(): Promise<TemplateData> {
    const userCount = await this.userService.getTotalUserCount();
    return {
      title: 'Admin dashboard',
      description: 'Admin dashboard',
      layout: Template.getSPALayout('admin'),
      template: 'admin/dashboard',
      stats: { userCount },
    };
  }

  @Get('user-info')
  @RenderView()
  async getUserInfoPage(): Promise<TemplateData> {
    return {
      title: 'User Info',
      description: 'Get user details',
      layout: Template.getSPALayout('admin'),
      template: 'admin/user-info',
    };
  }

  @Get('app-services')
  @RenderView()
  async getAppServicesPage(): Promise<TemplateData> {
    return {
      title: 'App Services',
      description: 'List of app services',
      layout: Template.getSPALayout('admin'),
      template: 'admin/app-services',
    };
  }
}
