/**
 * Importing npm packages
 */
import { NeverError } from '@leanderpaul/shadow-service';
import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import moment from 'moment';

/**
 * Importing user defined packages
 */
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
  @ApiExcludeEndpoint()
  async getHomePage(): Promise<TemplateData> {
    const currentUser = Context.getCurrentUser(true);
    const projection = User.constructProjection({ gender: 1, dob: 1 });
    const user = await this.userService.getUser(currentUser.uid, projection);
    if (!user) throw new NeverError('User not found');
    return {
      title: 'Home',
      description: 'Manage your Shadow account',
      styles: ['global'],
      scripts: ['jquery'],
      user: {
        firstName: user.firstName,
        lastName: user.lastName ?? '',
        fullName: `${user.firstName} ${user.lastName ?? ''}`,
        email: currentUser.primaryEmail,
        gender: user.gender ?? User.Gender.UNKNOWN,
        rawDob: user.dob ?? '1970-01-01',
        dob: moment(user.dob ?? '1970-01-01', 'YYYY-MM-DD').format('MMMM D, YYYY'),
      },
    };
  }
}
