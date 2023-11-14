/**
 * Importing npm packages
 */
import { type ConfigRecords, ConfigService } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface ServerConfigRecords extends ConfigRecords {
  /** Server configs */
  'app.hostname': string;
  'app.port': number;
  'app.domain': string;

  /** Database configs */
  'db.uri': string;

  /** Authentication configs */
  'cookie.name': string;
  'cookie.max-age': number;
  'csrf.secret-key': Buffer;
  'refresh-token.secret-key': Buffer;
}

/**
 * Declaring the constants
 */

class ServerConfigService extends ConfigService<ServerConfigRecords> {
  constructor() {
    super('shadow-accounts');

    this.set('app.hostname', { defaultValue: '0.0.0.0' });
    this.set('app.port', { defaultValue: '8080', validateType: 'number' });
    this.set('app.domain', { defaultValue: 'localhost' });

    this.set('db.uri', { defaultValue: 'mongodb://localhost/shadow-accounts' });

    const arr = new Array(43);
    const transformSecretKey = (value: string): Buffer => Buffer.from(value, 'base64');
    const secretKeyValidator = (value: string): boolean => Buffer.from(value, 'base64').length === 32;
    this.set('cookie.name', { defaultValue: 'sasid' });
    this.set('cookie.max-age', { defaultValue: '864000', validateType: 'number' }); // 10 days
    this.set('csrf.secret-key', { defaultValue: arr.fill('A').join(''), validator: secretKeyValidator, transform: transformSecretKey });
    this.set('refresh-token.secret-key', { defaultValue: arr.fill('B').join(''), validator: secretKeyValidator, transform: transformSecretKey });
  }
}

const globalRef = global as any;
export const Config: ServerConfigService = globalRef.configService || (globalRef.configService = new ServerConfigService());
