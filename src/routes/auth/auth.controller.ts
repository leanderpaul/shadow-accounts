/**
 * Importing npm packages
 */
import { Body, Controller, Get, HttpCode, Post, Redirect, Render, Res } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type FastifyReply } from 'fastify';

/**
 * Importing user defined packages
 */
import { AuthInfo, LoginResponse, LoginWithPasswordDto, LookUpDto, RegisterDto } from '@app/dtos/auth';
import { type TemplateData } from '@app/interfaces';
import { AuthService, UserAuthService } from '@app/modules/auth';
import { Context } from '@app/services';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly authService: AuthService,
  ) {}

  @Get('signin')
  @Render('auth/signin')
  @ApiExcludeEndpoint()
  getLoginPage(@Res() res: FastifyReply): FastifyReply | TemplateData {
    const user = Context.getCurrentUser();
    if (user) {
      const redirectUrl = this.authService.getRedirectUrl();
      return res.status(302).redirect(redirectUrl);
    }
    return {
      title: 'Sign In',
      description: 'Sign in to your Shadow account',
      styles: ['global', 'auth'],
      scripts: ['jquery'],
    };
  }

  @Post('signin')
  @HttpCode(200)
  @ApiResponse({ status: 200, type: LoginResponse })
  async login(@Body() body: LoginWithPasswordDto): Promise<LoginResponse> {
    await this.userAuthService.loginUser(body.email, body.password);
    const redirectUrl = this.authService.getRedirectUrl();
    return { success: true, redirectUrl };
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
  getRegisterPage(@Res() res: FastifyReply): FastifyReply | TemplateData {
    const user = Context.getCurrentUser();
    if (user) {
      const redirectUrl = this.authService.getRedirectUrl();
      return res.status(302).redirect(redirectUrl);
    }
    return {
      title: 'Create a Shadow account',
      description: 'Create a Shadow account',
      styles: ['global', 'auth'],
      scripts: ['jquery', 'notiflix'],
    };
  }

  @Post('signup')
  @HttpCode(200)
  @ApiResponse({ status: 200, type: LoginResponse })
  async register(@Body() body: RegisterDto): Promise<LoginResponse> {
    await this.userAuthService.registerNativeUser(body);
    const redirectUrl = this.authService.getRedirectUrl();
    return { success: true, redirectUrl };
  }

  @Get('signout')
  @Redirect('/')
  async logout(): Promise<void> {
    const session = Context.getCurrentSession();
    if (!session) return;
    const user = Context.getCurrentUser(true);
    await this.userAuthService.logout(user.uid, session.id);
  }
}
