/**
 * Importing npm packages
 */
import { NeverError, type Projection } from '@leanderpaul/shadow-service';
import { Body, Controller, Get, HttpCode, Patch } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { FormattedError } from '@app/dtos/errors';
import { UpdateUserDto, UserResponse } from '@app/dtos/user';
import { AuthType, UseAuthGuard } from '@app/guards';
import { User } from '@app/modules/database';
import { UserService } from '@app/modules/user';
import { Context } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const userProjection: Projection<User> = {
  aid: 1,
  uid: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  dob: 1,
  gender: 1,
  imageUrl: 1,
  createdAt: 1,
  updatedAt: 1,
};

@ApiTags('User')
@Controller('user')
@UseAuthGuard(AuthType.AUTHENTICATED)
@ApiResponse({ status: 401, type: FormattedError })
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getUserResponse(user?: User | null): UserResponse {
    if (!user) throw new NeverError('User not found');
    const email = user.emails[0]?.email as string;
    return { email, ...lodash.omit(user, ['_id', 'id', 'type', 'emails']) } as UserResponse;
  }

  @Get()
  @HttpCode(200)
  @ApiResponse({ status: 200, type: UserResponse })
  async getUser(): Promise<UserResponse> {
    const currentUser = Context.getCurrentUser(true);
    const user = await this.userService.getUser(currentUser.uid, userProjection);
    return this.getUserResponse(user);
  }

  @Patch()
  @HttpCode(200)
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 400, type: FormattedError })
  @ApiResponse({ status: 422, type: FormattedError })
  async updateUser(@Body() body: UpdateUserDto): Promise<UserResponse> {
    const currentUser = Context.getCurrentUser(true);
    const user = await this.userService.updateUser(currentUser.uid, body, userProjection);
    return this.getUserResponse(user);
  }
}
