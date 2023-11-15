/**
 * Importing npm packages
 */
import { type FieldError, ValidationError } from '@leanderpaul/shadow-service';
import { Catch, type ExceptionFilter, ForbiddenException, NotFoundException } from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { Error as MongooseError } from 'mongoose';

/**
 * Importing user defined packages
 */
import { Context, Logger } from '@app/services';

import { IAMErrorCode } from './iam-error-code.error';
import { IAMError } from './iam.error';

/**
 * Defining types
 */

export interface FormattedError {
  rid: string;
  code: string;
  type: string;
  message: string;
  fields?: FieldError[];
}

/**
 * Declaring the constants
 */

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = Logger.getLogger(ErrorFilter.name);

  private constructValidationMessage(errors: FieldError[]) {
    if (errors.length === 1) return `Validation failed for ${errors[0]?.field}`;
    const lastError = errors.pop();
    const fields = errors.map(error => error.field);
    return `Validation failed for ${fields.join(', ')} and ${lastError?.field}`;
  }

  private constructErrorPayload(error: Error): [number, FormattedError] {
    const rid = Context.getRID();

    if (error instanceof ForbiddenException) error = new IAMError(IAMErrorCode.IAM001);
    if (error instanceof ValidationError || error instanceof MongooseError.ValidationError) {
      const fields = error instanceof ValidationError ? error.getErrors() : Object.values(error.errors).map(err => ({ field: err.path, msg: err.message }));
      const code = IAMErrorCode.S003.getCode();
      const type = IAMErrorCode.S003.getType();
      const message = this.constructValidationMessage([...fields]);
      const statusCode = IAMErrorCode.S003.getStatusCode();
      return [statusCode, { rid, code, message, type, fields }];
    }

    const appError = error instanceof IAMError ? error : new IAMError(IAMErrorCode.S001);
    const code = appError.getCode();
    const type = appError.getType();
    const message = appError.getMessage();
    const statusCode = appError.getStatusCode();
    return [statusCode, { rid, code, message, type }];
  }

  catch(error: Error): FastifyReply {
    const res = Context.getCurrentResponse();
    if (error instanceof NotFoundException) return res.status(404).view('404', { title: 'Page not found' });

    this.logger.error(error);
    const [statusCode, payload] = this.constructErrorPayload(error);

    return res.status(statusCode).send(payload);
  }
}
