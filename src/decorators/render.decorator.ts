/**
 * Importing npm packages
 */
import { applyDecorators } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { type FastifyReply } from 'fastify';

/**
 * Importing user defined packages
 */
import { RENDER_VIEW_METADATA } from '@app/constants';
import { Func, TemplateData } from '@app/interfaces';
import { Context } from '@app/services';

/**
 * Defining types
 */

export type DynamicRender = TemplateData | FastifyReply;

/**
 * Declaring the constants
 */
const serverErrorData: TemplateData = {
  title: 'Server Error',
  description: 'Something went wrong on our end. Please try again later.',
  template: 'error/500',
};

function RenderTemplate(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const method = descriptor.value as Func;

    descriptor.value = async function (this: any, ...args: any[]) {
      const response = Context.getCurrentResponse();
      try {
        const data = await method.apply(this, args);
        if (data === response) return data;
        return response.render(data);
      } catch (err) {
        return response.render(serverErrorData);
      }
    } as any;

    Reflect.defineMetadata(RENDER_VIEW_METADATA, true, descriptor.value as Func);
    return descriptor;
  };
}

export const RenderView = (): MethodDecorator => applyDecorators(RenderTemplate(), ApiExcludeEndpoint());
