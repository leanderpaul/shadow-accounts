/**
 * Importing npm packages
 */
import { type JSONData, NeverError, TemplateEngine } from '@leanderpaul/shadow-service';
import { type FastifyPluginCallback, type FastifyReply } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { type TemplateData } from '@app/interfaces';

import { Context } from './context.service';

/**
 * Defining types
 */

declare module 'fastify' {
  interface FastifyReply {
    render(data: TemplateData): FastifyReply;
    render(status: number, data: TemplateData): FastifyReply;
  }
}

/**
 * Declaring the constants
 */

class TemplateService {
  private readonly engine;

  constructor() {
    this.engine = new TemplateEngine({ dir: 'views', minify: true });
  }

  getSPALayout(spa: 'user' | 'admin' = 'user'): TemplateData['layout'] {
    const request = Context.getCurrentRequest();
    const requestedWith = request.headers['x-requested-with'] as string | undefined;
    if (requestedWith?.toLowerCase() === 'xmlhttprequest') return 'component';
    return spa;
  }

  getFastifyPlugin(): FastifyPluginCallback {
    return fastifyPlugin((fastify, _opts, done) => {
      fastify.decorateReply('render', function (this: FastifyReply, status: number | TemplateData, data?: TemplateData): FastifyReply {
        let statusCode = typeof status === 'number' ? status : 200;
        if (!data) data = status as TemplateData;
        if (typeof data.template === 'string' && data.template.startsWith('error/')) {
          const code = data.template.substring(6, 9);
          statusCode = parseInt(code) || 500;
        }

        const html = Template.render(data);
        return this.status(statusCode).type('text/html; charset=utf-8').send(html);
      });

      done();
    });
  }

  render(data: TemplateData): string {
    const layout = `layouts/${data.layout ?? 'bare'}`;
    const templateData = lodash.omit(data, ['template', 'layout']);
    if (!templateData.description) templateData.description = templateData.title;

    const currentUser = Context.getCurrentUser();
    if (currentUser) {
      const user: Record<string, JSONData> = lodash.pick(currentUser, 'firstName', 'lastName', 'role', 'status');
      user.uid = currentUser.uid.toString();
      user.fullName = `${user.firstName} ${user.lastName ?? ''}`;
      const primaryEmail = currentUser.emails.find(email => email.primary);
      if (!primaryEmail) throw new NeverError('Primary email not found');
      user.primaryEmail = primaryEmail.email;
      const serviceAccount = Context.getCurrentServiceAccount();
      if (serviceAccount) user.iamRole = serviceAccount.role;
      templateData.user = templateData.user ? lodash.merge(user, templateData.user) : user;
    }

    const view = this.engine.render(data.template, templateData);
    return this.engine.render(layout, { ...templateData, body: view });
  }
}

const globalRef = global as any;
export const Template: TemplateService = globalRef.templateService || (globalRef.templateService = new TemplateService());
