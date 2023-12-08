/**
 * Importing npm packages
 */
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { UserModule, UserService } from '@app/modules/user';
import { Seeder } from '@app/seeder';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('UserService', () => {
  let userService: UserService;
  let moduleRef: TestingModule;
  let seeder: Seeder;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [UserModule] }).compile();
    userService = moduleRef.get(UserService);
    seeder = await Seeder.init();
    await seeder.createUser({ email: 'user-one@shadow-apps.com', firstName: 'User One' });
  });

  describe('getTotalUserCount', () => {
    it('should return the total number of users', async () => {
      const totalUserCount = await userService.getTotalUserCount();
      expect(totalUserCount).toBeInteger();
    });
  });

  afterAll(async () => {
    await moduleRef.close();
    await seeder.close();
  });
});
