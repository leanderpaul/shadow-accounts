/**
 * Importing npm packages
 */

import { type JSONData } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface TemplateData {
  title: string;
  description: string;
  styles?: string[];
  scripts?: string[];

  /**
   * @default 'bare'
   */
  layout?: 'bare' | 'user' | 'admin' | 'component';

  template: string;
  libs?: {
    jquery?: boolean;
    notiflix?: boolean;
  };
  [key: string]: JSONData | undefined;
}
