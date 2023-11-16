/**
 * Importing npm packages
 */
import { ValidationError } from '@leanderpaul/shadow-service';
import { type ArgumentMetadata, Injectable, type PipeTransform, type Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { type ValidationError as ClassValidationError, type ValidatorOptions, validate } from 'class-validator';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const validatorOptions: ValidatorOptions = {
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  validationError: { target: false, value: false },
};

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private isValidationRequired<T>(metatype?: Type<T>): metatype is Type<T> {
    if (!metatype) return false;
    const types: Type[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private constructValidationMessage(property: string, constraints?: Record<string, string>) {
    if (!constraints) return 'validation failed';
    return Object.values(constraints)
      .map(c => c.replace(property, '').trim())
      .join(', ');
  }

  private toValidationError(errors: ClassValidationError[]) {
    const validationError = new ValidationError();
    for (const error of errors) {
      const message = this.constructValidationMessage(error.property, error.constraints);
      validationError.addFieldError(error.property, message);
    }
    return validationError;
  }

  async transform(value: object, metadata: ArgumentMetadata): Promise<object> {
    if (!this.isValidationRequired(metadata.metatype)) return value;
    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object, validatorOptions);
    if (errors.length > 0) throw this.toValidationError(errors);
    return value;
  }
}
