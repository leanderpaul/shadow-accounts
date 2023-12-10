/**
 * Importing npm packages
 */
import { Expect as BunExpect, expect } from 'bun:test';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Expect {
  static toBeID(): BunExpect<RegExp> {
    return expect.stringMatching(/^[a-f0-9]{24}$/);
  }

  static toBeDate(): BunExpect<RegExp> {
    return expect.stringMatching(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/);
  }
}
