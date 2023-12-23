/**
 * Importing npm packages
 */
import fs from 'node:fs';
import path from 'node:path';

import { type FastifyPluginCallback, type FastifyReply } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import Handlebars from 'handlebars';
import { type Options as MinifierOptions, minify } from 'html-minifier';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { type TemplateData } from '@app/interfaces';

import { Config } from './config.service';

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
const minifierOptions: MinifierOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  decodeEntities: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
};

const templateAlias: Record<string, string> = {
  jquery:
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
  notiflix: '<script src="https://cdn.jsdelivr.net/npm/notiflix@3.2.6/dist/notiflix-aio-3.2.6.min.js"></script>',
};

class TemplateService {
  private readonly templates = new Map<string, HandlebarsTemplateDelegate>();
  private readonly compilerOptions: Record<string, unknown>;

  constructor() {
    const helpers = this.registerHelpers();
    this.compilerOptions = { knownHelpers: helpers, knownHelpersOnly: true, preventIndent: true };
  }

  private registerHelpers(): Record<string, boolean> {
    Handlebars.registerHelper('alias', function (this: HandlebarsTemplateDelegate, key: string, opts: Handlebars.HelperOptions) {
      const alias = templateAlias[key];
      if (alias) return alias;
      return opts.fn(this);
    });

    return { alias: true };
  }

  private getTemplate(templateName: string): HandlebarsTemplateDelegate {
    let template = this.templates.get(templateName);
    if (template) return template;

    const templatePath = path.join(process.cwd(), 'views', templateName + '.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');
    const minifiedContent = minify(content, minifierOptions);
    template = Handlebars.compile(minifiedContent, this.compilerOptions);

    if (Config.isProd()) this.templates.set(templateName, template);
    return template;
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

  render(data: TemplateData) {
    const templateData = lodash.omit(data, ['template']);
    if (typeof data.template === 'string') data.template = ['layout', data.template];
    const templates = data.template.toReversed();
    let html = '';
    for (const template of templates) {
      const compiledTemplate = this.getTemplate(template);
      const data = { ...templateData, body: html };
      html = compiledTemplate(data);
    }
    return html;
  }
}

const globalRef = global as any;
export const Template: TemplateService = globalRef.templateService || (globalRef.templateService = new TemplateService());
