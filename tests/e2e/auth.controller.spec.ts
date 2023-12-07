/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

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
      response.expectError('S003', ['email']);
    });

    it('should return auth info error for non-existing email', async () => {
      const response = await MockRequest.post('/auth/lookup', { email: 'unknown-user@shadow-apps.com' });
      response.expectStatusCode(200);
      response.expectData({ userExists: false, isLoginAllowed: false, error: { code: 'U001', message: 'User not found' } });
    });

    it('should return auth info for existing email', async () => {
      const response = await MockRequest.post('/auth/lookup', { email: 'admin@shadow-apps.com' });
      response.expectStatusCode(200);
      response.expectData({ userExists: true, isLoginAllowed: true });
    });
  });

  describe('POST /auth/signin', () => {
    it('should return error for non-existing email', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'invalid', password: 'invalid' });
      response.expectError('S003', ['email']);
    });

    it('should return error for invalid credentials', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'admin@shadow-apps.com', password: 'invalid' });
      response.expectError('U007');
    });

    it('should return cookie for valid credentials', async () => {
      const response = await MockRequest.post('/auth/signin', { email: 'admin@shadow-apps.com', password: 'Password@123' });
      response.expectStatusCode(200);
      response.expectCookies('admin');
      response.expectData({ success: true, redirectUrl: '/' });
    });
  });

  describe('GET /auth/signin', () => {
    it('should return the sign in page', async () => {
      const response = await MockRequest.get('/auth/signin');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Sign In' });
    });

    it('should redirect when accessed with cookie', async () => {
      const response = await MockRequest.get('/auth/signin').session('admin').setFetchOptions({ redirect: 'manual' });
      response.expectStatusCode(302);
    });
  });

  describe('POST /auth/signup', () => {
    it('should return error for invalid inputs', async () => {
      const body = { firstName: '@#$', email: 'invalid-email', password: 'invalid-password' };
      const response = await MockRequest.post('/auth/signup', body);
      response.expectError('S003', ['firstName', 'email', 'password']);
    });

    it('should return error for existing account', async () => {
      const body = { firstName: 'Admin', email: 'admin@shadow-apps.com', password: 'Password@123' };
      const response = await MockRequest.post('/auth/signup', body);
      response.expectError('U002');
    });

    it('should return cookie for valid input', async () => {
      const body = { firstName: 'John', lastName: 'Doe', email: 'john-doe@shadow-apps.com', password: 'Password@123' };
      const response = await MockRequest.post('/auth/signup', body);
      response.expectStatusCode(200);
      response.expectCookies();
      response.expectData({ success: true, redirectUrl: '/' });
    });
  });

  describe('GET /auth/signup', () => {
    it('should return the sign up page', async () => {
      const response = await MockRequest.get('/auth/signup');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Create a Shadow account' });
    });

    it('should redirect when accessed with cookie', async () => {
      const response = await MockRequest.get('/auth/signup').session('admin').setFetchOptions({ redirect: 'manual' });
      response.expectStatusCode(302);
    });
  });

  describe('GET /auth/signout', () => {
    it('should redirect to home page when accessed without cookie', async () => {
      const response = await MockRequest.get('/auth/signout').setFetchOptions({ redirect: 'manual' });
      response.expectStatusCode(302);
    });

    it('should redirect to home page when accessed with cookie', async () => {
      const response = await MockRequest.get('/auth/signout').session('admin').setFetchOptions({ redirect: 'manual' });
      response.expectStatusCode(302);
      const cookie = response.getHeader('Set-Cookie');
      expect(cookie).toContain('sasid=;');
    });
  });
});
