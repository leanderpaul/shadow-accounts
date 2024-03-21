/**
 * Importing npm packages
 */
import { describe, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { Expect, REST, Tests } from '@tests/utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('e2e: UserController', () => {
  describe('GET /user', () => {
    Tests.unauthenicatedAPI('GET', '/user');

    it('should return the user info', async () => {
      const response = await REST.get('/user').session('tester-1');
      response.expectStatusCode(200);
      response.expectData({
        aid: Expect.toBeID(),
        uid: Expect.toBeID(),
        email: 'test-user-1@shadow-apps.test',
        firstName: 'Tester One',
        createdAt: Expect.toBeDate(),
        updatedAt: Expect.toBeDate(),
      });
    });
  });

  describe('PATCH /user', () => {
    Tests.unauthenicatedAPI('PATCH', '/user');

    it('should return error for invalid input', async () => {
      const body = { firstName: '', gender: 'MALE', dob: '2100-01-01' };
      const response = await REST.patch('/user', body).session('tester-1');
      response.expectError('S003', ['firstName', 'gender', 'dob']);
    });

    it('should update user for valid input', async () => {
      const body = { lastName: 'Test', gender: 1, dob: '2000-01-01' };
      const response = await REST.patch('/user', body).session('tester-1');
      response.expectStatusCode(200);
      response.expectData({
        aid: Expect.toBeID(),
        uid: Expect.toBeID(),
        email: 'test-user-1@shadow-apps.test',
        firstName: 'Tester One',
        lastName: 'Test',
        gender: 1,
        dob: '2000-01-01',
        createdAt: Expect.toBeDate(),
        updatedAt: Expect.toBeDate(),
      });
    });

    it('should unset field for null value', async () => {
      const body = { lastName: '', gender: null, dob: null };
      const response = await REST.patch('/user', body).session('tester-1');
      response.expectStatusCode(200);
      response.expectData({
        aid: Expect.toBeID(),
        uid: Expect.toBeID(),
        email: 'test-user-1@shadow-apps.test',
        firstName: 'Tester One',
        createdAt: Expect.toBeDate(),
        updatedAt: Expect.toBeDate(),
      });
    });
  });
});
