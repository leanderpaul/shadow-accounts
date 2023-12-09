/**
 * Importing npm packages
 */
import { HttpCode, applyDecorators } from '@nestjs/common';
import { type ApiResponseMetadata, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { FormattedError } from '@app/dtos/errors';
import { ValidationErrorResponse } from '@app/dtos/responses';

/**
 * Defining types
 */

type ErrorStatusCode = 400 | 404 | 409 | 422;

type SuccessStatusCode = 200 | 201 | 204;

type SuccessType = ApiResponseMetadata['type'];

type ErrorStatusCodes = ErrorStatusCode | ErrorStatusCode[];

/**
 * Declaring the constants
 */
const descriptions: Record<ErrorStatusCode, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Validation Failed',
};

export function ApiResponse(successStatusCode: SuccessStatusCode, successType?: SuccessType, errorStatusCode: ErrorStatusCodes = []): MethodDecorator {
  const responses = [HttpCode(successStatusCode), SwaggerApiResponse({ status: successStatusCode, type: successType, description: 'Success' })];
  if (typeof errorStatusCode === 'number') errorStatusCode = [errorStatusCode];
  for (const code of errorStatusCode) {
    const errorType = code === 422 ? ValidationErrorResponse : FormattedError;
    const description = descriptions[code];
    responses.push(SwaggerApiResponse({ status: code, type: errorType, description }));
  }
  return applyDecorators(...responses);
}
