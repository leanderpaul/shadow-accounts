/**
 * Importing npm packages
 */
import { expect } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { IAMErrorCode } from '@app/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

fetch;

export class MockResponse {
  static cookies = new Map<string, string>();

  constructor(
    private readonly response: Response,
    private readonly body: string,
  ) {}

  getBody(): Record<string, any> {
    return JSON.parse(this.body);
  }

  expectStatusCode(statusCode: number): void {
    expect(this.response.status).toBe(statusCode);
  }

  expectHTML(text?: string): void {
    expect(this.response.type).toMatch(/text\/html/);
    if (text) expect(this.response.text).toContain(text);
  }

  expectJSONData(obj: Record<string, unknown>): void {
    const { type } = this.response;
    const body = this.getBody();
    expect(type).toMatch(/application\/json/);
    expect(body).toBeDefined();
    expect(body).toMatchObject(obj);
  }

  expectJSONError(code: string): void {
    const error = (IAMErrorCode as any)[code] as IAMErrorCode | undefined;
    if (!error) throw new Error(`Invalid error code: ${code}`);
    const { type } = this.response;
    const body = this.getBody();
    this.expectStatusCode(error.getStatusCode());
    expect(type).toMatch(/application\/json/);
    expect(body.code).toBe(code);
    expect(body.type).toBe(error.getType());
    expect(body.rid).toBeGreaterThan(0);
  }

  /**
   * Expects token to be present and if key is provided, it store cookie for future use
   * @param key
   */
  expectCookies(key?: string): void {
    const cookie = this.response.headers.get('Set-Cookie');
    expect(cookie).toMatch(/^sasid=[a-zA-Z0-9%= \-/\\;]{30,}$/);
    if (key && cookie) MockResponse.cookies.set(key, cookie);
  }
}
