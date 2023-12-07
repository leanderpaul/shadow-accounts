/**
 * Importing npm packages
 */
import { HttpCode, Render as RenderTempate, applyDecorators } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const Render = (template: string): MethodDecorator => applyDecorators(HttpCode(200), RenderTempate(template), ApiExcludeEndpoint());
