/**
 * Importing npm packages
 */
import { UpdateQuery } from 'mongoose';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class UpdateQueryHelper {
  private update: UpdateQuery<unknown> = {};

  constructor(update: object = {}) {
    for (const key in update) {
      let value = (update as Record<string, unknown>)[key];
      if (typeof value === 'string') value = value.trim();
      if (value === null || value === '' || value === -1) this.unset(key);
      else this.set(key, value);
    }
  }

  set<T>(key: string, value: T): UpdateQueryHelper {
    if (!this.update.$set) this.update.$set = {};
    this.update.$set[key] = value;
    return this;
  }

  unset(key: string): UpdateQueryHelper {
    if (!this.update.$unset) this.update.$unset = {};
    this.update.$unset[key] = '';
    return this;
  }

  inc(key: string, value: number): UpdateQueryHelper {
    if (!this.update.$inc) this.update.$inc = {};
    this.update.$inc[key] = value;
    return this;
  }

  push<T>(key: string, value: T): UpdateQueryHelper {
    if (!this.update.$push) this.update.$push = {};
    this.update.$push[key] = value;
    return this;
  }

  addToSet<T>(key: string, value: T): UpdateQueryHelper {
    if (!this.update.$addToSet) this.update.$addToSet = {};
    this.update.$addToSet[key] = value;
    return this;
  }

  pull<T>(key: string, value: T): UpdateQueryHelper {
    if (!this.update.$pull) this.update.$pull = {};
    this.update.$pull[key] = value;
    return this;
  }

  getUpdate(): UpdateQuery<unknown> {
    return this.update;
  }
}
