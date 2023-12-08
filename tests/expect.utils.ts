/**
 * Importing npm packages
 */
import { Expect as BunExpect, expect } from 'bun:test';

/**
 * Importing user defined packages
 */
import { MockRequest } from './mocks';

/**
 * Defining types
 */

interface Test {
  name: string;
  test: () => void | Promise<void>;
}

type TestType = 'UNAUTHENTICATED_REQUEST';

/**
 * Declaring the constants
 */

const tests: Record<TestType, Test> = {
  UNAUTHENTICATED_REQUEST: {
    name: 'should return error for unauthenticated request',
    test: () => MockRequest.get('/user').then(response => response.expectError('IAM003')),
  },
};

export class Expect {
  static getTest(type: TestType): Test {
    const test = tests[type];
    if (!test) throw new Error(`Test '${type}' not found`);
    return test;
  }

  static toBeID(): BunExpect<RegExp> {
    return expect.stringMatching(/^[a-f0-9]{24}$/);
  }

  static toBeDate(): BunExpect<RegExp> {
    return expect.stringMatching(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/);
  }
}
