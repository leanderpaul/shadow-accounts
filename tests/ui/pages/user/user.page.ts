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

export type UserPages = 'Profile' | 'Security' | 'Sessions';

/**
 * Declaring the constants
 */

export class UserPage extends AuthenticatedPage {
  constructor(page: Page, session: string) {
    super(page, session);
  }

  async load(): Promise<void> {
    await this.setup();
    await this.page.goto('/');
  }

  async goto(page: UserPages): Promise<void> {
    await this.page.getByText(page).click();
  }

  async expectAdminAccess(): Promise<void> {
    const adminPanelLink = this.page.getByRole('link', { name: 'Admin Panel' });
    await expect(adminPanelLink).toBeVisible();
  }
}
