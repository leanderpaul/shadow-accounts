/**
 * Importing npm packages
 */
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Importing user defined packages
 */
import { Auth, Utils } from '@tests/utils/node';

/**
 * Defining types
 */

export type NotificationType = keyof typeof notificationTypes;

/**
 * Declaring the constants
 */
const notificationTypes = {
  success: 'notiflix-notify-success',
  error: 'notiflix-notify-failure',
};

export class AuthenticatedPage {
  private readonly dropDownButton: Locator;

  constructor(
    protected readonly page: Page,
    private readonly session: string,
  ) {
    this.dropDownButton = page.locator('#dropdown-btn');
  }

  protected async setup(): Promise<void> {
    const cookie = Auth.getSession(this.session);
    const parsedCookie = Utils.getParsedCookie(cookie);
    await this.page.context().addCookies([parsedCookie]);
  }

  async signOut(): Promise<void> {
    await this.dropDownButton.click();
    await this.page.getByText('Sign Out').click();
  }

  async gotoProfilePage(): Promise<void> {
    await this.page.getByText('Profile').click();
  }

  async gotoSecurityPage(): Promise<void> {
    await this.page.getByText('Security').click();
  }

  async gotoSessionsPage(): Promise<void> {
    await this.page.getByText('Sessions').click();
  }

  async closeModal(id: string): Promise<void> {
    await this.page.locator(`#${id}.modal.open .close`).click();
  }

  async expectNotification(type: NotificationType, msg: string): Promise<void> {
    const className = notificationTypes[type];
    const classNameRegex = new RegExp(className + ' ');
    const notification = this.page.locator('#NotiflixNotifyWrap > .notiflix-notify').filter({ hasText: msg });

    await expect(notification).toBeVisible();
    await expect(notification).toHaveClass(classNameRegex);
  }
}
