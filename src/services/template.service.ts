/**
 * Importing npm packages
 */
import { type FastifyViewOptions } from '@fastify/view';
import Handlebars, { type HelperOptions, type TemplateDelegate } from 'handlebars';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const jqueryCDN =
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>';

export class TemplateService {
  private readonly aliasMap: Map<string, string>;

  constructor(private readonly viewOptions: Partial<FastifyViewOptions>) {
    const aliasMap = new Map<string, string>();
    aliasMap.set('jquery', jqueryCDN);
    aliasMap.set('notiflix', '<script src="https://cdn.jsdelivr.net/npm/notiflix@3.2.6/dist/notiflix-aio-3.2.6.min.js"></script>');

    this.aliasMap = aliasMap;
  }

  private registerHelpers(): Record<string, boolean> {
    const aliasMap = this.aliasMap;

    Handlebars.registerHelper('alias', function (this: TemplateDelegate, key: string, opts: HelperOptions) {
      const alias = aliasMap.get(key);
      if (alias) return alias;
      return opts.fn(this);
    });

    return { alias: true };
  }

  registerAlias(key: string, value: string): void {
    this.aliasMap.set(key, value);
  }

  getViewEngine(): FastifyViewOptions {
    const helpers = this.registerHelpers();
    const defaultOptions: FastifyViewOptions = {
      engine: { handlebars: Handlebars },
      options: {
        compileOptions: { knownHelpers: helpers, knownHelpersOnly: true, preventIndent: true },
        useHtmlMinifier: require('html-minifier'),
        htmlMinifierOptions: {
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
        },
      },
    };
    return lodash.merge(defaultOptions, this.viewOptions);
  }
}
