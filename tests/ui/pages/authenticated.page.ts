/**
 * Importing npm packages
 */
import { type Locator, type Page } from '@playwright/test';

/**
 * Importing user defined packages
 */
import { Auth, Utils } from '@tests/utils/node';

import { BarePage } from './bare.page';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class AuthenticatedPage extends BarePage {
  private readonly dropDownButton: Locator;
  private readonly session: string;

  constructor(page: Page, session: string) {
    super(page);
    this.session = session;
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
}
