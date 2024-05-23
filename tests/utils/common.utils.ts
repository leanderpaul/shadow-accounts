/**
 * Importing npm packages
 */
import moment from 'moment';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  expires?: number;
}

/**
 * Declaring the constants
 */
const storage = new Map<string, string>();

export class Utils {
  private constructor() {}

  static setValue(key: string, value: string): void {
    storage.set(key, value);
  }

  static getValue(key: string): string | undefined;
  static getValue(key: string, throwError: true): string;
  static getValue(key: string, throwError?: true): string | undefined {
    const value = storage.get(key);
    if (throwError && value === undefined) throw new Error(`Value not found for key: ${key}`);
    return value;
  }

  static getEmail(id: string, browser?: string): string {
    if (!browser) browser = this.getValue('browser');
    const prefix = browser ? `${browser}` : 'test';
    return `${prefix}-${id}@shadow-apps.test`;
  }

  static getParsedCookie(cookie: string): Cookie {
    const parsedCookie: Cookie = { name: 'sasid', value: '', domain: 'localhost', path: '/' };
    for (const part of cookie.split(';')) {
      const [key, value] = part.trim().split('=') as [string, string | undefined];
      if (key === 'sasid') parsedCookie.value = value as string;
      else if (key === 'Max-Age') parsedCookie.expires = moment().add(Number(value), 'seconds').unix();
      else if (key === 'Path') parsedCookie.path = value;
      else if (key === 'HttpOnly') parsedCookie.httpOnly = true;
    }
    return parsedCookie;
  }
}
