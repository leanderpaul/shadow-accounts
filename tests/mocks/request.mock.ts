/**
 * Importing npm packages
 */
import { type JSONData } from '@leanderpaul/shadow-service';
import lodash from 'lodash';

/**
 * Importing user defined packages
 */
import { Logger } from '@app/services';

import { MockAuth } from './auth.mock';
import { MockResponse } from './response.mock';

/**
 * Defining types
 */
export type RestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('MockRequest');

export class MockRequest {
  private readonly headers: Record<string, string> = {};
  private fetchOptions: FetchRequestInit = { redirect: 'manual' };
  private body: object | null = null;

  constructor(
    private readonly method: RestMethod,
    private readonly url: string,
  ) {
    this.header('Accept', '*/*');
    this.header('Accept-Language', 'en-GB,en;q=0.5');
    this.header('Accept-Encoding', 'gzip, deflate, br');
  }

  static get(url: string): MockRequest {
    return new MockRequest('GET', url);
  }

  static post(url: string, body?: Record<string, JSONData>): MockRequest {
    const request = new MockRequest('POST', url);
    if (body) request.send(body);
    return request;
  }

  static patch(url: string, body?: Record<string, JSONData>): MockRequest {
    const request = new MockRequest('PATCH', url);
    if (body) request.send(body);
    return request;
  }

  static put(url: string, body?: Record<string, JSONData>): MockRequest {
    const request = new MockRequest('PUT', url);
    if (body) request.send(body);
    return request;
  }

  static delete(url: string): MockRequest {
    return new MockRequest('DELETE', url);
  }

  private async execute(): Promise<MockResponse> {
    const opts: FetchRequestInit = lodash.merge(this.fetchOptions, { headers: this.headers, method: this.method });
    if (this.body) opts.body = JSON.stringify(this.body);
    const port = process.env.PORT ?? 8081;
    const url = `http://127.0.0.1:${port}${this.url}`;
    const response = await fetch(url, opts);
    const body = await response.text();
    const cookies = response.headers.get('Set-Cookie') ?? null;
    if (cookies?.startsWith('sasid=;')) MockAuth.deleteSession(this.headers['Cookie'] as string);
    logger.debug(`${this.method} ${this.url} => ${response.status}`, { reqBody: this.body, resBody: body, cookies });
    return new MockResponse(response, body);
  }

  setFetchOptions(opts: FetchRequestInit): MockRequest {
    this.fetchOptions = opts;
    return this;
  }

  send(data: Record<string, JSONData>): MockRequest {
    this.header('Content-Type', 'application/json');
    this.body = data;
    return this;
  }

  header(key: string, value: string): MockRequest {
    this.headers[key] = value;
    return this;
  }

  session(key: string): MockRequest {
    const cookie = MockAuth.getSession(key);
    this.header('Cookie', cookie);
    return this;
  }

  then<T>(resolve: (value: MockResponse) => T, reject?: (reason: any) => void): Promise<T | void> {
    return this.execute().then(resolve, reject);
  }

  catch(reject: (reason: any) => void): Promise<MockResponse | void> {
    return this.execute().then(null, reject);
  }

  finally(callback: () => void): Promise<MockResponse> {
    return this.execute().finally(callback);
  }
}
