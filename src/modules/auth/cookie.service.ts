/**
 * Importing npm packages
 */
import { type CookieSerializeOptions } from '@fastify/cookie';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { type ID } from '@app/modules/database';
import { Config, Context } from '@app/services';

/**
 * Defining types
 */

export interface UserCookie {
  uid: ID;
  token: string;
}

/**
 * Declaring the constants
 */

@Injectable()
export class CookieService {
  private getCookieOptions(): [string, CookieSerializeOptions] {
    const name = Config.get('cookie.name');
    const maxAge = Config.get('cookie.max-age');
    const secure = Config.get('app.env') === 'production';
    const domain = secure ? Config.get('app.domain') : undefined;
    return [name, { maxAge, secure, domain, httpOnly: true, path: '/' }];
  }

  private encodeCookie(uid: ID, token: string): string {
    return uid.toString() + '|' + token;
  }

  private decodeCookie(cookie: string): UserCookie | null {
    const data = cookie.split('|') as [string, string];
    const uid = new Types.ObjectId(data[0]);
    if (data.length !== 2 || !uid) return null;
    return { uid, token: data[1] };
  }

  clearCookies(): void {
    const [name, opts] = this.getCookieOptions();
    const res = Context.getCurrentResponse();
    res.clearCookie(name, opts);
  }

  setUserCookies(uid: ID, token: string): void {
    const [name, opts] = this.getCookieOptions();
    const value = this.encodeCookie(uid, token);
    const res = Context.getCurrentResponse();
    res.setCookie(name, value, opts);
  }

  getUserCookies(): UserCookie | null {
    const name = Config.get('cookie.name');
    const req = Context.getCurrentRequest();
    const cookie = req.cookies[name];
    if (!cookie) return null;
    return this.decodeCookie(cookie);
  }
}
