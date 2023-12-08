/**
 * Importing npm packages
 */
import { type FieldError } from '@leanderpaul/shadow-service';
import { expect } from 'bun:test';
import { type CheerioAPI, load as loadDOM } from 'cheerio';

/**
 * Importing user defined packages
 */
import { IAMErrorCode } from '@app/errors';

import { MockAuth } from './auth.mock';

/**
 * Defining types
 */

export interface ExpectedHTML {
  title?: string;
  text?: string;
}

/**
 * Declaring the constants
 */
export class MockResponse {
  private dom: CheerioAPI | undefined;

  constructor(
    private readonly response: Response,
    private readonly body: string,
  ) {}

  getBody(): Record<string, any> {
    return JSON.parse(this.body);
  }

  getHeaders(): Response['headers'] {
    return this.response.headers;
  }

  getHeader(key: string): string | null {
    return this.getHeaders().get(key);
  }

  getHTMLDOM(): CheerioAPI {
    if (!this.dom) this.dom = loadDOM(this.body);
    return this.dom;
  }

  expectStatusCode(statusCode: number): void {
    expect(this.response.status).toBe(statusCode);
  }

  expectRedirect(url: string): void {
    const location = this.getHeader('Location');
    this.expectStatusCode(302);
    expect(location).toBe(url);
  }

  expectHTML(expected: ExpectedHTML): void {
    const contentType = this.getHeader('Content-Type');
    expect(contentType).toContain('text/html;');
    const $ = this.getHTMLDOM();
    if (expected?.title) {
      const actualTitle = $('head title').text();
      const expectedTitle = `${expected.title} - Shadow Accounts`;
      expect(actualTitle).toBe(expectedTitle);
    }
    if (expected?.text) {
      const actualText = $('body').text();
      expect(actualText).toContain(expected.text);
    }
  }

  expectData(obj: Record<string, unknown>): void {
    const contentType = this.getHeader('Content-Type');
    expect(contentType).toContain('application/json;');

    const body = this.getBody();
    expect(body).toBeDefined();
    expect(body).toMatchObject(obj);
  }

  expectError(code: string, fields?: string[]): void {
    const error = (IAMErrorCode as any)[code] as IAMErrorCode | undefined;
    if (!error) throw new Error(`Invalid error code: ${code}`);

    const contentType = this.getHeader('Content-Type');
    expect(contentType).toContain('application/json;');
    this.expectStatusCode(error.getStatusCode());

    const body = this.getBody();
    expect(body.rid).toBeGreaterThan(0);
    expect(body.type).toBe(error.getType());
    expect(body.code).toBe(code);
    expect(body.message).toBeString();
    if (fields) {
      const expected = fields.reduce((obj, field) => ({ ...obj, [field]: expect.any(String) }), {});
      const actual = body.fields.reduce((obj: object, item: FieldError) => ({ ...obj, [item.field]: item.msg }), {});
      expect(body.fields).toHaveLength(fields.length);
      expect(actual).toMatchObject(expected);
    }
  }

  /**
   * Expects token to be present and if key is provided, it store cookie for future use
   * @param key
   */
  expectCookies(key?: string): void {
    const cookie = this.response.headers.get('Set-Cookie');
    expect(cookie).toMatch(/^sasid=[a-zA-Z0-9%= _\-/\\;]{30,}$/);
    if (key && cookie) MockAuth.setSession(key, cookie);
  }
}
