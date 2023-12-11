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
import { Render } from '@app/decorators';
import { AuthType, UseAuthGuard } from '@app/guards';
import { type TemplateData } from '@app/interfaces';
import { User } from '@app/modules/database';
import { UserService } from '@app/modules/user';
import { Context } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Controller()
export class RouterController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Render('home')
  @UseAuthGuard(AuthType.AUTHENTICATED)
  async getHomePage(): Promise<TemplateData> {
    const currentUser = Context.getCurrentUser(true);
    const projection = User.constructProjection({ gender: 1, dob: 1, emails: 1 });
    const user = await this.userService.getUser(currentUser.uid, projection);
    if (!user) throw new NeverError('User not found');
    const gender = user.gender ? User.Gender[user.gender] : 'Prefer not to say';
    return {
      title: 'Home',
      description: 'Manage your Shadow account',
      styles: ['global', 'home'],
      scripts: ['jquery', 'notiflix', 'home'],
      user: {
        emails: user.emails.sort(a => (a.primary ? -1 : 1)) as any,
        firstName: user.firstName,
        lastName: user.lastName ?? '-',
        fullName: `${user.firstName} ${user.lastName ?? ''}`,
        email: currentUser.primaryEmail,
        rawGender: user.gender ?? '-1',
        gender: lodash.capitalize(gender),
        rawDob: user.dob ?? '',
        dob: user.dob ? moment(user.dob, 'YYYY-MM-DD').format('MMMM D, YYYY') : '-',
      },
    };
  }
}
