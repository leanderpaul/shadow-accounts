/**
 * Importing npm packages
 */
import { describe, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { MockRequest } from '@tests/mocks';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('e2e: AuthController', () => {
  describe('POST /auth/lookup', () => {
    it('should return error for invalid email', async () => {
      const response = await MockRequest.post('/auth/lookup', { email: 'invalid' });
      response.expectStatusCode(400);
      response.expectError('S003', ['email']);
    });

    it.todo('should return auth info error for non-existing email', async () => {
      const response = await MockRequest.post('/auth/lookup', { email: 'unknown-user@shadow-apps.com' });
      response.expectStatusCode(200);
      response.expectData({ userExists: false, isLoginAllowed: false, error: { code: 'U001', message: 'User not found' } });
    });

    it.todo('should return auth info for existing email', async () => {
      const response = await MockRequest.post('/auth/lookup', { email: 'admin@shadow-apps.com' });
      response.expectStatusCode(200);
      response.expectData({ userExists: true, isLoginAllowed: true });
    });
  });

  describe('GET /auth/signin', () => {
    it('should return the sign in page', async () => {
      const response = await MockRequest.get('/auth/signin');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Sign In' });
    });
  });

  describe('POST /auth/signin', () => {
    it('should return error for non-existing email', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'invalid', password: 'invalid' });
      response.expectStatusCode(400);
      response.expectError('S003', ['email']);
    });

    it.todo('should return error for invalid credentials', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'admin@shadow-apps.com', password: 'invalid' });
      response.expectStatusCode(400);
      response.expectError('S003', ['email']);
    });

    it.todo('should return cookie for valid credentials', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'admin@shadow-apps.com', password: 'Password@123' });
      response.expectStatusCode(200);
      response.expectData({ success: true });
    });
  });
});
