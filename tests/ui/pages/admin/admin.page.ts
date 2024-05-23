/**
 * Importing npm packages
 */
import { type Page, expect } from '@playwright/test';

/**
 * Importing user defined packages
 */

import { AuthenticatedPage } from '../authenticated.page';

/**
 * Defining types
 */

export type AccessType = 'none' | 'IAMAdmin';

export type AdminPages = 'Overview' | 'User Info';

/**
 * Declaring the constants
 */

export class AdminPage extends AuthenticatedPage {
  constructor(page: Page, session: string) {
    super(page, session);
  }

  async load(): Promise<void> {
    await this.setup();
    await this.page.goto('/admin');
  }

  async expectAccess(type: AccessType): Promise<void> {
    switch (type) {
      case 'none':
        await expect(this.page.getByText('404')).toBeVisible();
        await expect(this.page.getByText('Page Not Found')).toBeVisible();
        break;

      case 'IAMAdmin':
        await expect(this.page).toHaveTitle(/Shadow Accounts Admin Panel$/);
        await expect(this.page.getByRole('link', { name: 'Overview' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'User Info' })).toBeVisible();
        break;

      default:
        throw new Error('Invalid access type');
    }
  }

  async goto(page: AdminPages): Promise<void> {
    await this.page.getByText(page).click();
  }
}
