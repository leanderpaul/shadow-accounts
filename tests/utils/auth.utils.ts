/**
 * Importing npm packages
 */

import { Utils } from './common.utils';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Auth {
  private static sessions = new Map<string, string>();

  static async initSession(key: string, email?: string): Promise<void> {
    if (!email) email = Utils.getEmail(key);
    const session = this.sessions.get(key);
    if (session) return;
    const port = process.env.PORT ?? 8081;
    const url = `http://127.0.0.1:${port}/auth/signin`;
    const body = { email, password: 'Password@123' };
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (response.status !== 200) throw new Error(`Failed to sign in: ${email}`);
    const cookies = response.headers.get('Set-Cookie');
    if (!cookies) throw new Error('Response does not contain cookies');
    this.sessions.set(key, cookies);
  }

  static clearSession(key: string): void {
    this.sessions.delete(key);
  }

  static deleteSession(session: string): void {
    for (const [key, value] of this.sessions.entries()) {
      if (value === session) {
        this.sessions.delete(key);
        break;
      }
    }
  }

  static setSession(key: string, session: string): void {
    this.sessions.set(key, session);
  }

  static getSession(key: string): string {
    const session = this.sessions.get(key);
    if (!session) throw new Error(`Session not found for: ${key}`);
    return session;
  }
}
