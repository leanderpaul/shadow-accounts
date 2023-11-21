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

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [UserModule] }).compile();
    userService = moduleRef.get(UserService);
    await Seeder.seed({ peronalUsers: 10 });
  });

  describe('getTotalUserCount', () => {
    it('should return the total number of users', async () => {
      const totalUserCount = await userService.getTotalUserCount();
      expect(totalUserCount).toBe(11);
    });
  });

  afterAll(async () => {
    await moduleRef.close();
    await Seeder.close();
  });
});
