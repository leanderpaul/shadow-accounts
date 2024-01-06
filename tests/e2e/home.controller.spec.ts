/**
 * Importing npm packages
 */
import { describe, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { MockRequest } from '@tests/mocks';
import { Tests } from '@tests/utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('e2e: HomeController', () => {
  describe('GET /', () => {
    Tests.unauthenticatedPage('/');

    it('should return the home page when authenticated', async () => {
      const response = await MockRequest.get('/').session('tester-1');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Home' });
    });

    it('should return the home page as a component', async () => {
      const response = await MockRequest.get('/', true).session('tester-1');
      response.expectStatusCode(200);
      response.expectHTML({ title: 'Home', component: true });
    });
  });
});
