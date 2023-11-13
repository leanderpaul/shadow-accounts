/**
 * Importing npm packages
 */
import { MongoServerError } from 'mongodb';
import { Query, type Schema } from 'mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

/**
 * Importing user defined packages
 */
import { IAMError } from '@app/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

function defaultLean(this: Query<unknown, unknown>): void {
  if (this._mongooseOptions.lean === true) this.lean({ virtuals: true });
}

export function handleDuplicateKeyError(throwError: IAMError | Record<string, IAMError>): (error: Error, _result: unknown, next: (error?: Error) => void) => void {
  return function (error, _result, next) {
    if (error instanceof MongoServerError && error.code === 11000) {
      if (throwError instanceof IAMError) return next(throwError);
      for (const [key, value] of Object.entries(throwError)) {
        if (error.message.includes(key)) return next(value);
      }
    }
    return next(error);
  };
}

export function defaultOptionsPlugin(schema: Schema): void {
  schema.plugin(mongooseLeanVirtuals);

  schema.pre('find', defaultLean);
  schema.pre('findOne', defaultLean);
  schema.pre('findOneAndUpdate', defaultLean);
  schema.pre('findOneAndDelete', defaultLean);
}
