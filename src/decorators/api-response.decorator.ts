/**
 * Importing npm packages
 */
import { HttpCode, type Type, applyDecorators } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { FormattedError } from '@app/dtos/errors';
import { ValidationErrorResponse } from '@app/dtos/responses';

/**
 * Defining types
 */

type ErrorStatusCode = 400 | 404 | 409 | 422;

/**
 * Declaring the constants
 */
const descriptions: Record<ErrorStatusCode, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Validation Failed',
};

export function ApiResponse(successStatusCode: number, successType?: Type, errorStatusCode: ErrorStatusCode | ErrorStatusCode[] = []): MethodDecorator {
  const responses = [HttpCode(successStatusCode), SwaggerApiResponse({ status: successStatusCode, type: successType, description: 'Success' })];
  if (typeof errorStatusCode === 'number') errorStatusCode = [errorStatusCode];
  for (const code of errorStatusCode) {
    const errorType = code === 422 ? ValidationErrorResponse : FormattedError;
    const description = descriptions[code];
    responses.push(SwaggerApiResponse({ status: code, type: errorType, description }));
  }
  return applyDecorators(...responses);
}
