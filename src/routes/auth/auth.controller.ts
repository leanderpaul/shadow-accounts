/**
 * Importing npm packages
 */
import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { ApiResponse, type DynamicRender, RenderView } from '@app/decorators';
import { AuthInfo, LoginResponse, LoginWithPasswordDto, LookUpDto, RegisterDto } from '@app/dtos/auth';
import { type TemplateData } from '@app/interfaces';
import { AuthService, UserAuthService } from '@app/modules/auth';
import { UserEmailService } from '@app/modules/user';
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
    private readonly userEmailService: UserEmailService,
  ) {}

  @Get('signin')
  @RenderView()
  getLoginPage(): DynamicRender {
    const user = Context.getCurrentUser();
    if (user) {
      const res = Context.getCurrentResponse();
      const redirectUrl = this.authService.getRedirectUrl();
      return res.status(302).redirect(redirectUrl);
    }
    return {
      template: 'auth/signin',
      title: 'Sign In',
      description: 'Sign in to your Shadow account',
      styles: ['global', 'auth'],
      libs: { jquery: true },
    };
  }

  @Post('signin')
  @ApiResponse(200, LoginResponse, 422)
  async login(@Body() body: LoginWithPasswordDto): Promise<LoginResponse> {
    await this.userAuthService.loginUser(body.email, body.password);
    const redirectUrl = this.authService.getRedirectUrl();
    return { success: true, redirectUrl };
  }

  @Post('lookup')
  @ApiResponse(200, AuthInfo, 422)
  lookup(@Body() body: LookUpDto): Promise<AuthInfo> {
    return this.userAuthService.getAuthInfo(body.email);
  }

  @Get('signup')
  @RenderView()
  getRegisterPage(): DynamicRender {
    const user = Context.getCurrentUser();
    if (user) {
      const res = Context.getCurrentResponse();
      const redirectUrl = this.authService.getRedirectUrl();
      return res.status(302).redirect(redirectUrl);
    }
    return {
      template: 'auth/signup',
      title: 'Create a Shadow account',
      description: 'Create a Shadow account',
      styles: ['global', 'auth'],
      libs: { jquery: true, notiflix: true },
    };
  }

  @Post('signup')
  @ApiResponse(200, LoginResponse, [400, 409, 422])
  async register(@Body() body: RegisterDto): Promise<LoginResponse> {
    await this.userAuthService.registerNativeUser(body);
    const redirectUrl = this.authService.getRedirectUrl();
    return { success: true, redirectUrl };
  }

  @Get('verify-email')
  @RenderView()
  async getVerifyEmailPage(@Query('digest') digestQuery: string): Promise<TemplateData> {
    let status = { success: false, email: '', verified: false };
    const digest = await this.userEmailService.getVerifyEmailDigest(digestQuery);
    if (digest) {
      const verified = await this.userEmailService.verifyUserEmail(digest.identifier).catch(() => false);
      status = { success: true, email: digest.identifier, verified };
    }
    return {
      template: 'auth/verify-email',
      title: 'Verify your email',
      description: 'Verify your email',
      styles: ['global'],
      data: status,
      status: status.success ? 'success' : 'error',
    };
  }

  @Get('signout')
  @Redirect('/')
  @ApiResponse(302)
  async logout(): Promise<void> {
    const session = Context.getCurrentSession();
    if (!session) return;
    const user = Context.getCurrentUser(true);
    await this.userAuthService.logout(user.uid, session.id);
  }
}
