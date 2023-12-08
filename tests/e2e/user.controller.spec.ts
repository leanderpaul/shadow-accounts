/**
 * Importing npm packages
 */
import { describe, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { Expect } from '@tests/expect.utils';
import { MockRequest } from '@tests/mocks';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('e2e: UserController', () => {
  describe('GET /user', () => {
    const authTest = Expect.getTest('UNAUTHENTICATED_REQUEST');
    it(authTest.name, authTest.test);

    it('should return the user info', async () => {
      const response = await MockRequest.get('/user').session('tester-1');
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
    const authTest = Expect.getTest('UNAUTHENTICATED_REQUEST');
    it(authTest.name, authTest.test);

    it('should return error for invalid input', async () => {
      const body = { firstName: '', gender: 'MALE', dob: '2100-01-01' };
      const response = await MockRequest.patch('/user', body).session('tester-1');
      response.expectError('S003', ['firstName', 'gender', 'dob']);
    });

    it('should update user for valid input', async () => {
      const body = { lastName: 'Test', gender: 1, dob: '2000-01-01' };
      const response = await MockRequest.patch('/user', body).session('tester-1');
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
      const response = await MockRequest.patch('/user', body).session('tester-1');
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
