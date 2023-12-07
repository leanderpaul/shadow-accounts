/**
 * Importing npm packages
 */
import { NeverError, type Projection } from '@leanderpaul/shadow-service';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { ApiResponse } from '@app/decorators';
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
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getUserResponse(user?: User | null): UserResponse {
    if (!user) throw new NeverError('User not found');
    const email = user.emails[0]?.email as string;
    return { email, ...lodash.omit(user, ['_id', 'id', 'type', 'emails']) } as UserResponse;
  }

  @Get()
  @ApiResponse(200, UserResponse)
  async getUser(): Promise<UserResponse> {
    const currentUser = Context.getCurrentUser(true);
    const user = await this.userService.getUser(currentUser.uid, userProjection);
    return this.getUserResponse(user);
  }

  @Patch()
  @ApiResponse(200, UserResponse, 422)
  async updateUser(@Body() body: UpdateUserDto): Promise<UserResponse> {
    const currentUser = Context.getCurrentUser(true);
    const user = await this.userService.updateUser(currentUser.uid, body, userProjection);
    return this.getUserResponse(user);
  }
}
