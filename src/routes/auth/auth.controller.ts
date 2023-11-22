/**
 * Importing npm packages
 */
import { Body, Controller, Get, HttpCode, Post, Render } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AuthInfo, LoginWithPasswordDto, LookUpDto } from '@app/dtos/auth';
import { OperationResponse } from '@app/dtos/responses';
import { type TemplateData } from '@app/interfaces';
import { UserAuthService } from '@app/modules/auth';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Get('signin')
  @Render('auth/signin')
  @ApiExcludeEndpoint()
  getLoginPage(): TemplateData {
    return { title: 'Sign In', styles: ['auth'] };
  }

  @Post('signin')
  @HttpCode(200)
  @ApiResponse({ status: 200, type: OperationResponse })
  async login(@Body() body: LoginWithPasswordDto): Promise<OperationResponse> {
    await this.userAuthService.loginUser(body.email, body.password);
    return { success: true };
  }

  @Post('lookup')
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthInfo })
  verifyEmail(@Body() body: LookUpDto): Promise<AuthInfo> {
    return this.userAuthService.getAuthInfo(body.email);
  }

  @Get('signup')
  @Render('auth/signup')
  @ApiExcludeEndpoint()
  getRegisterPage(): TemplateData {
    return { title: 'Create a Shadow account', styles: ['auth'] };
  }
}
