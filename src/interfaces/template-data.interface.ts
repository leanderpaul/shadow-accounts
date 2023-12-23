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

/**
 * Declaring the constants
 */

export interface TemplateData {
  title: string;
  description: string;
  styles?: string[];
  scripts?: string[];
  template: string | string[];
  [key: string]: JSONData | undefined;
}
