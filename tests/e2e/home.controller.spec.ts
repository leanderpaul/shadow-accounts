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

describe('e2e: HomeController', () => {
  describe('GET /', () => {
    it('should redirect to sign in page when unauthenticated', async () => {
      const response = await MockRequest.get('/');
      response.expectRedirect('/auth/signin?redirectUrl=%252F');
    });

    it('should return the home page when authenticated', async () => {
      const response = await MockRequest.get('/').session('tester-1');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Home' });
    });
  });
});
