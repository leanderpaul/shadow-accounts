/**
 * Importing npm packages
 */
import { applyDecorators } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

/**
 * Importing user defined packages
 */
import { RENDER_VIEW_METADATA } from '@app/constants';
import { Func, TemplateData } from '@app/interfaces';
import { Context, Template } from '@app/services';

/**
 * Defining types
 */

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
      let html = '';
      let statusCode = 200;
      try {
        const data = await method.apply(this, args);
        if (data === response) return data;
        html = await Template.render(data);
      } catch (err) {
        statusCode = 500;
        html = await Template.render(serverErrorData);
      }
      return response.status(statusCode).type('text/html;').send(html);
    } as any;

    Reflect.defineMetadata(RENDER_VIEW_METADATA, true, descriptor.value as Func);
    return descriptor;
  };
}

export const RenderView = (): MethodDecorator => applyDecorators(RenderTemplate(), ApiExcludeEndpoint());
