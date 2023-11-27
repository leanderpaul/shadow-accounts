/**
 * Importing npm packages
 */
import { MailService as ShadowMailService } from '@leanderpaul/shadow-service';
import { Injectable } from '@nestjs/common';

/**
 * Importing user defined packages
 */
import { Config } from './config.service';
import { Logger } from './logger.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const from = 'no-reply@shadow-apps.com';

@Injectable()
export class MailService extends ShadowMailService {
  protected readonly logger = Logger.getLogger(MailService.name);
  private readonly templateMap = new Map<string, string>();

  constructor() {
    super();

    const defaultData = {} as Record<string, string>;
    defaultData.domain = Config.get('app.domain');
    this.appendDefaultData(defaultData);

    this.templateMap.set('email-verification', 'd-24603f515b7b41c380cffe32c6cd6a94');
    this.templateMap.set('password-reset', '');
  }

  sendEmailVerificationMail(email: string, firstName: string, code: string): void {
    const templateId = this.templateMap.get('email-verification');
    if (!templateId) {
      this.logger.error('Template not found');
      return;
    }
    const subject = 'Verify your email address';
    const data = { email, firstName, code };
    this.sendMail({ from, to: email, subject, templateId, templateData: data });
  }

  sendPasswordResetMail(emails: string[], firstName: string, code: string): void {
    const templateId = this.templateMap.get('email-verification');
    if (!templateId) {
      this.logger.error('Template not found');
      return;
    }
    const subject = 'Reset your password';
    const data = { emails, firstName, code };
    for (const email of emails) {
      this.sendMail({ from, to: email, subject, templateId, templateData: data });
    }
  }
}
