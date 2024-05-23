/**
 * Importing npm packages
 */
import { expect, test as it } from '@playwright/test';

/**
 * Importing user defined packages
 */
import { Auth, Utils } from '@tests/utils/node';

import { HomePage } from './pages';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { beforeAll, describe } = it;

beforeAll(async ({ browserName }) => {
  Utils.setValue('browser', browserName);
  await Auth.initSession('user-1');
  await Auth.initSession('user-2');
});

describe('Home Page: Profile Component', () => {
  it('should display the profile details', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    const email = Utils.getEmail('user-1');
    await expect(home.getInfo('name')).toHaveText('One Tester');
    await expect(home.getInfo('email')).toHaveText(email);

    await expect(home.getFormField('firstName', 'span')).toHaveText('One');
    await expect(home.getFormField('lastName', 'span')).toHaveText('Tester');
    await expect(home.getFormField('gender', 'span')).toHaveText('Prefer not to say');
    await expect(home.getFormField('dob', 'span')).toHaveText('-');
  });

  it('should throw error for invalid user details update', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    const today = new Date().toISOString().split('T')[0];
    await home.editProfile({ firstName: '', profileImageURL: 'invalid', dob: today }, 'save');

    await expect(home.getFormFieldError('firstName')).toHaveText('First name cannot be empty');
    await expect(home.getFormFieldError('dob')).toHaveText('Please enter a valid date of birth with a minimum age of 5 years');
  });

  it('should update the user details', async ({ page }) => {
    const home = new HomePage(page, 'user-2');
    await home.load();

    await home.editProfile({ firstName: 'Two Updated', lastName: 'Tester', dob: '2000-01-01', gender: 'Male' }, 'save');

    await expect(home.getFormField('firstName', 'span')).toHaveText('Two Updated');
    await expect(home.getFormField('lastName', 'span')).toHaveText('Tester');
    await expect(home.getFormField('gender', 'span')).toHaveText('Male');
    await expect(home.getFormField('dob', 'span')).toHaveText('January 1, 2000');
  });
});

describe('Home Page: Email Address Component', () => {
  it('should display my email address', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    const email = Utils.getEmail('user-1');
    const emailAddresses = home.getEmailAddress();
    const emailAddress = emailAddresses.first();
    await expect(emailAddresses).toHaveCount(1);
    await expect(emailAddress.locator('.email')).toHaveText(email);
    await expect(emailAddress.locator('.badge')).toHaveCount(1);
    await expect(emailAddress.locator('.badge')).toHaveText('Primary');
  });

  it('should throw error for adding invalid email address', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    await home.addEmailAddress('invalid');
    await expect(home.getFormFieldError('new-email')).toHaveText('Please enter a valid email address');
    await home.closeAddEmailAddressModal();

    const email = Utils.getEmail('user-1');
    await home.addEmailAddress(email);
    await expect(home.getFormFieldError('new-email')).toHaveText('User email address already exists');
  });

  it('should be able to add new email address', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    const email = 'secondary-' + Utils.getEmail('user-1');
    await home.addEmailAddress(email);

    const emailAddresses = home.getEmailAddress();
    const emailAddress = emailAddresses.nth(1);
    await home.expectNotification('success', 'Email address added successfully');
    await expect(emailAddresses).toHaveCount(2);
    await expect(emailAddress.locator('.email')).toHaveText(email);
    await expect(emailAddress.locator('.badge')).toHaveCount(1);
    await expect(emailAddress.locator('.badge')).toHaveText('Unverified');
  });

  it('should be able to remove email address', async ({ page }) => {
    const home = new HomePage(page, 'user-1');
    await home.load();

    const emailAddresses = home.getEmailAddress();
    const emailAddress = emailAddresses.nth(1);
    await emailAddress.hover();
    await emailAddress.locator('.actions svg').click();

    await home.expectNotification('success', 'Email address deleted successfully');
    await expect(emailAddresses).toHaveCount(1);
  });
});
