/**
 * Importing npm packages
 */
import { expect, test as it } from '@playwright/test';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { describe } = it;

describe('Sign In', () => {
  it('loads the page', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page).toHaveTitle('Sign In - Shadow Accounts');
  });

  it('should return error for invalid and non-existing email', async ({ page }) => {
    await page.goto('/auth/signin');
    const nextButton = page.getByRole('button', { name: 'Next' });
    const emailError = page.locator('#email .error');

    /** Testing invalid email address */
    await page.fill('input[name="email"]', 'invalid');
    await nextButton.click();
    await expect(emailError).toHaveText('Please enter a valid email address');

    /** Testing non existent email address */
    await page.fill('input[name="email"]', 'unknown-user@mail.com');
    await nextButton.click();
    await expect(emailError).toHaveText('This account cannot be found. Please use a different account or sign up for a new account.');
  });

  it('should return error for invalid password', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test-user-1@shadow-apps.test');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.fill('input[name="password"]', 'invalid-password');
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.locator('#password .error')).toHaveText('Incorrect password');
  });

  it('should sign in successfully', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test-user-1@shadow-apps.test');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.fill('input[name="password"]', 'Password@123');
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page).toHaveTitle('Home - Shadow Accounts');
  });
});
