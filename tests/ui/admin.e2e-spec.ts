/**
 * Importing npm packages
 */
import { test as it } from '@playwright/test';

/**
 * Importing user defined packages
 */
import { Auth, Utils } from '@tests/utils/node';

import { AdminPage } from './pages';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { describe, beforeAll } = it;

beforeAll(async ({ browserName }) => {
  Utils.setValue('browser', browserName);
  await Auth.initSession('admin-1');
  await Auth.initSession('user-1');
});

describe('Admin Panel', () => {
  it('throws page not found for users without access', async ({ page }) => {
    const admin = new AdminPage(page, 'user-1');
    await admin.load();

    await admin.expectAccess('none');
  });

  it('should display the admin panel', async ({ page }) => {
    const admin = new AdminPage(page, 'admin-1');
    await admin.load();

    await admin.expectAccess('IAMAdmin');
  });
});
