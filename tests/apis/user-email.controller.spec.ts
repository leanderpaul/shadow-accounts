/**
 * Importing npm packages
 */
import { beforeAll, describe, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { UserEmailService } from '@app/modules/user';
import { Seeder } from '@app/seeder';
import { Auth, REST, Tests } from '@tests/utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('e2e: UserEmailController', () => {
  describe('GET /user/emails', () => {
    Tests.unauthenicatedAPI('GET', '/user/emails');

    it('should return the user emails', async () => {
      const response = await REST.get('/user/emails').session('tester-1');
      response.expectStatusCode(200);
      response.expectData([{ email: 'test-user-1@shadow-apps.test', primary: true, verified: true }]);
    });
  });

  describe('POST /user/emails', () => {
    Tests.unauthenicatedAPI('POST', '/user/emails');

    it('should return error for invalid email', async () => {
      const response = await REST.post('/user/emails').session('tester-1').send({ email: 'invalid-email' });
      response.expectError('S003', ['email']);
    });

    it('should return error for duplicate email', async () => {
      const response = await REST.post('/user/emails').session('tester-1').send({ email: 'test-user-2@shadow-apps.test' });
      response.expectError('U009');
    });

    it('should create the user email', async () => {
      const email = 'test-user-1-2@shadow-apps.test';
      const response = await REST.post('/user/emails').session('tester-1').send({ email });
      response.expectStatusCode(201);
      response.expectData({ email, verified: false });
    });
  });

  describe('DELETE /user/emails', () => {
    Tests.unauthenicatedAPI('DELETE', '/user/emails');

    it('should return error for invalid email', async () => {
      const response = await REST.delete('/user/emails').session('tester-1').send({ email: 'invalid-email' });
      response.expectError('S003', ['email']);
    });

    it('should return error for primary email', async () => {
      const response = await REST.delete('/user/emails').session('tester-1').send({ email: 'test-user-1@shadow-apps.test' });
      response.expectError('U012');
    });

    it('should return error for non-existent email', async () => {
      const response = await REST.delete('/user/emails').session('tester-1').send({ email: 'test-user-1-3@shadow-apps.test' });
      response.expectError('U010');
    });

    it('should delete the user email', async () => {
      const response = await REST.delete('/user/emails').session('tester-1').send({ email: 'test-user-1-2@shadow-apps.test' });
      response.expectStatusCode(204);
    });
  });

  describe('POST /user/emails/primary', () => {
    const session = 'user-email-tester';
    const email = 'user-email-tester@shadow-apps.test';
    const verifiedSecondaryEmail = 'secondary-email-2@shadow-apps.test';
    const unverifiedSecondaryEmail = 'secondary-email-1@shadow-apps.test';

    beforeAll(async () => {
      const seeder = await Seeder.init();
      const user = await seeder.createUser({ email, firstName: 'Email Tester', verified: true });
      const userEmailServie = seeder.getService(UserEmailService);
      await userEmailServie.addUserEmail(user.uid, unverifiedSecondaryEmail);
      await userEmailServie.addUserEmail(user.uid, verifiedSecondaryEmail, true);
      await seeder.close();

      await Auth.initSession(session, email);
    });

    Tests.unauthenicatedAPI('POST', '/user/emails/primary');

    it('should return error for invalid email', async () => {
      const response = await REST.post('/user/emails/primary').session(session).send({ email: 'invalid-email' });
      response.expectError('S003', ['email']);
    });

    it('should return error for non-existent email', async () => {
      const response = await REST.delete('/user/emails').session(session).send({ email: 'secondary-email-3@shadow-apps.test' });
      response.expectError('U010');
    });

    it('should throw error for unverified email', async () => {
      const response = await REST.post('/user/emails/primary').session(session).send({ email: unverifiedSecondaryEmail });
      response.expectError('U011');
    });

    it('should set the primary user email', async () => {
      const response = await REST.post('/user/emails/primary').session(session).send({ email: verifiedSecondaryEmail });
      response.expectStatusCode(200);
      response.expectData({ success: true });
    });
  });
});
