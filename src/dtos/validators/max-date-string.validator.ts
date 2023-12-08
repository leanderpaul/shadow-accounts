/**
 * Importing npm packages
 */
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import moment from 'moment';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function MaxDateString(date: Date | (() => Date), validationOptions?: ValidationOptions): MethodDecorator {
  return function (object, propertyName) {
    registerDecorator({
      name: 'maxDateString',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [date],
      options: validationOptions,
      async: false,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [dateFn] = args.constraints;
          const date = dateFn instanceof Date ? dateFn : dateFn();
          return new Date(value) < date;
        },
        defaultMessage(args: ValidationArguments) {
          const [dateFn] = args.constraints;
          const date = dateFn instanceof Date ? dateFn : dateFn();
          return `must be less than ${moment(date).format('YYYY-MM-DD')}`;
        },
      },
    });
  };
}
