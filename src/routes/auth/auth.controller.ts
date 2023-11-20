/**
 * Importing npm packages
 */
import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { AuthInfo, LoginWithPasswordDto, LookUpDto } from '@app/dtos/auth';
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
    return { title: 'Sign In', styles: ['auth'], scripts: ['auth'] };
  }

  @Post('signin')
  async login(@Body() body: LoginWithPasswordDto): Promise<object> {
    await this.userAuthService.loginUser(body.email, body.password);
    return {};
  }

  @Post('lookup')
  @ApiResponse({ status: 200, type: AuthInfo })
  verifyEmail(@Body() body: LookUpDto): Promise<AuthInfo> {
    return this.userAuthService.getAuthInfo(body.email);
  }
}
