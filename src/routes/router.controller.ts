/**
 * Importing npm packages
 */
import { NeverError } from '@leanderpaul/shadow-service';
import { Controller, Get } from '@nestjs/common';
import lodash from 'lodash';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { AccessGuard, RenderView } from '@app/decorators';
import { type TemplateData } from '@app/interfaces';
import { User } from '@app/modules/database';
import { UserService } from '@app/modules/user';
import { Context, Template } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Controller()
@AccessGuard()
export class RouterController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RenderView()
  async getHomePage(): Promise<TemplateData> {
    const currentUser = Context.getCurrentUser(true);
    const projection = User.constructProjection({ gender: 1, dob: 1, emails: 1 });
    const user = await this.userService.getUser(currentUser.uid, projection);
    if (!user) throw new NeverError('User not found');
    const gender = user.gender ? User.Gender[user.gender] : 'Prefer not to say';
    return {
      layout: Template.getSPALayout(),
      template: 'user/home',
      title: 'Home',
      description: 'Manage your Shadow account',
      user: {
        emails: user.emails.sort(a => (a.primary ? -1 : 1)) as any,
        firstName: user.firstName,
        lastName: user.lastName ?? '-',
        fullName: `${user.firstName} ${user.lastName ?? ''}`,
        email: user.emails.find(a => a.primary)?.email ?? '-',
        rawGender: user.gender ?? '-1',
        gender: lodash.capitalize(gender),
        rawDob: user.dob ?? '',
        dob: user.dob ? moment(user.dob, 'YYYY-MM-DD').format('MMMM D, YYYY') : '-',
      },
    };
  }

  @Get('security')
  @RenderView()
  getSecurityPage(): TemplateData {
    return {
      layout: Template.getSPALayout(),
      template: 'user/security',
      title: 'Security',
      description: 'Manage your Shadow account security',
    };
  }

  @Get('sessions')
  @RenderView()
  getSessionsPage(): TemplateData {
    return {
      layout: Template.getSPALayout(),
      template: 'user/sessions',
      title: 'Sessions',
      description: 'Manage your Shadow account sessions',
    };
  }
}
