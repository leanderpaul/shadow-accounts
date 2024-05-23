/**
 * Importing npm packages
 */
import { type Locator } from '@playwright/test';

/**
 * Importing user defined packages
 */
import { UserPage } from './user.page';

/**
 * Defining types
 */

interface EditProfile {
  firstName?: string;
  lastName?: string;
  profileImageURL?: string;
  gender?: 'Male' | 'Female' | 'Prefer not to say';
  dob?: string;
}

/**
 * Declaring the constants
 */

export class HomePage extends UserPage {
  async editProfile(value: EditProfile, action?: 'save' | 'cancel'): Promise<void> {
    await this.page.getByRole('button', { name: 'Edit' }).click();
    if (value.firstName !== undefined) await this.page.locator('#firstName input').fill(value.firstName);
    if (value.lastName !== undefined) await this.page.locator('#lastName input').fill(value.lastName);
    if (value.profileImageURL !== undefined) await this.page.locator('#imageUrl input').fill(value.profileImageURL);
    if (value.dob !== undefined) await this.page.locator('#dob input').fill(value.dob);
    if (value.gender !== undefined) {
      await this.page.locator('#gender input').click();
      await this.page.getByText(value.gender, { exact: true }).click();
    }
    if (action === 'save') await this.page.getByRole('button', { name: 'Save' }).click();
    else if (action === 'cancel') await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  getInfo(type?: 'name' | 'email'): Locator {
    const subLocator = type === 'name' ? 'h1' : type === 'email' ? 'p' : '';
    return this.page.locator(`#info ${subLocator}`);
  }

  getFormField(name: string, selector = ''): Locator {
    return this.page.locator(`#${name}.form-field ${selector}`);
  }

  getFormFieldError(name: string): Locator {
    return this.page.locator(`#${name}.form-field .error`);
  }

  getEmailAddress(): Locator {
    return this.page.locator('#emails .email-addresses li');
  }

  async addEmailAddress(email: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add Email Address' }).click();
    await this.page.getByPlaceholder('Email Address').fill(email);
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();
  }

  closeAddEmailAddressModal(): Promise<void> {
    return this.closeModal('add-email-modal');
  }
}
