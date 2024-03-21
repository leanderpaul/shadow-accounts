/**
 * Importing npm packages
 */
import { type FieldError, type JSONData } from '@leanderpaul/shadow-service';
import { expect } from 'bun:test';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { IAMErrorCode } from '@app/errors';
import { Logger } from '@app/services';

import { Auth } from './auth.utils';

/**
 * Defining types
 */
export type RestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ExpectedHTML {
  component?: boolean;
  title?: string;
  text?: string;
}

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('REST');

export class APIRequest {
  private readonly headers: Record<string, string> = {};
  private fetchOptions: FetchRequestInit = { redirect: 'manual' };
  private body: object | null = null;

  constructor(
    private readonly method: RestMethod,
    private readonly urlPath: string,
  ) {
    this.header('Accept', '*/*');
    this.header('Accept-Language', 'en-GB,en;q=0.5');
    this.header('Accept-Encoding', 'gzip, deflate, br');
  }

  private async execute(): Promise<APIResponse> {
    const opts: FetchRequestInit = lodash.merge(this.fetchOptions, { headers: this.headers, method: this.method });
    if (this.body) opts.body = JSON.stringify(this.body);
    const url = REST.getURL(this.urlPath);
    const response = await fetch(url, opts);
    const body = await response.text();
    const cookies = response.headers.get('Set-Cookie') ?? null;
    if (cookies?.startsWith('sasid=;')) Auth.deleteSession(this.headers['Cookie'] as string);
    logger.debug(`${this.method} ${this.urlPath} => ${response.status}`, { reqBody: this.body, resBody: body, cookies });
    return new APIResponse(response, body);
  }

  setFetchOptions(opts: FetchRequestInit): APIRequest {
    this.fetchOptions = opts;
    return this;
  }

  send(data: Record<string, JSONData>): APIRequest {
    this.header('Content-Type', 'application/json');
    this.body = data;
    return this;
  }

  header(key: string, value: string): APIRequest {
    this.headers[key] = value;
    return this;
  }

  session(key: string): APIRequest {
    const cookie = Auth.getSession(key);
    this.header('Cookie', cookie);
    return this;
  }

  then<T>(resolve: (value: APIResponse) => T, reject?: (reason: any) => void): Promise<T | void> {
    return this.execute().then(resolve, reject);
  }

  catch(reject: (reason: any) => void): Promise<APIResponse | void> {
    return this.execute().then(null, reject);
  }

  finally(callback: () => void): Promise<APIResponse> {
    return this.execute().finally(callback);
  }
}

export class APIResponse {
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

  expectStatusCode(statusCode: number): void {
    expect(this.response.status).toBe(statusCode);
  }

  expectRedirect(url: string): void {
    const location = this.getHeader('Location');
    this.expectStatusCode(302);
    expect(location).toBe(url);
  }

  expectData(obj: Record<string, unknown> | Record<string, unknown>[]): void {
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
    if (key && cookie) Auth.setSession(key, cookie);
  }
}

export class REST {
  static getURL(path: string): string {
    const port = process.env.PORT ?? 8081;
    return `http://127.0.0.1:${port}${path}`;
  }

  static get(url: string): APIRequest {
    return new APIRequest('GET', url);
  }

  static post(url: string, body?: Record<string, JSONData>): APIRequest {
    const request = new APIRequest('POST', url);
    if (body) request.send(body);
    return request;
  }

  static patch(url: string, body?: Record<string, JSONData>): APIRequest {
    const request = new APIRequest('PATCH', url);
    if (body) request.send(body);
    return request;
  }

  static put(url: string, body?: Record<string, JSONData>): APIRequest {
    const request = new APIRequest('PUT', url);
    if (body) request.send(body);
    return request;
  }

  static delete(url: string): APIRequest {
    return new APIRequest('DELETE', url);
  }
}
