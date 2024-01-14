/**
 * Importing npm packages
 */
import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AccessGuard, ApiResponse } from '@app/decorators';
import { OperationResponse } from '@app/dtos/responses';
import { UserEmailInputDto, UserEmailResponse } from '@app/dtos/user';
import { type UserEmail } from '@app/modules/database/database.types';
import { UserEmailService } from '@app/modules/user';
import { Context } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('User Email')
@Controller('user/emails')
@AccessGuard()
export class UserEmailController {
  constructor(private readonly userEmailService: UserEmailService) {}

  @Get()
  @ApiResponse(200, [UserEmailResponse], 404)
  getUserEmails(): UserEmail[] {
    const user = Context.getCurrentUser(true);
    return user.emails;
  }

  @Post()
  @ApiResponse(201, UserEmailResponse, [404, 409, 422])
  addUserEmail(@Body() body: UserEmailInputDto): Promise<UserEmail> {
    const user = Context.getCurrentUser(true);
    return this.userEmailService.addUserEmail(user.uid, body.email);
  }

  @Delete()
  @ApiResponse(204, undefined, [404, 422])
  async deleteUserEmail(@Body() body: UserEmailInputDto): Promise<void> {
    const user = Context.getCurrentUser(true);
    await this.userEmailService.deleteUserEmail(user.uid, body.email);
  }

  @Post('resend')
  @ApiResponse(204, undefined, [400, 404, 422])
  async resendEmailVerificationMail(@Body() body: UserEmailInputDto): Promise<void> {
    const user = Context.getCurrentUser(true);
    await this.userEmailService.sendEmailVerificationMail(user.uid, body.email);
  }

  @Post('primary')
  @ApiResponse(200, OperationResponse, [400, 404, 422])
  async setPrimaryUserEmail(@Body() body: UserEmailInputDto): Promise<OperationResponse> {
    const user = Context.getCurrentUser(true);
    const success = await this.userEmailService.setPrimaryUserEmail(user.uid, body.email);
    return { success };
  }
}
