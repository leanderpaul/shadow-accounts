/**
 * Importing npm packages
 */
import { type Page, expect } from '@playwright/test';

/**
 * Importing user defined packages
 */

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

export class BarePage {
  constructor(protected readonly page: Page) {}

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
