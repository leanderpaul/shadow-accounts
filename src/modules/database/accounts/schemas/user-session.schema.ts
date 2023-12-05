/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Schema({
  _id: false,
  versionKey: false,
  timestamps: { updatedAt: false },
})
export class UserSession {
  /** User session ID used to identify the session */
  @Prop({
    type: 'number',
    required: true,
  })
  id: number;

  /** User session token. This is the value stored in the user's cookie */
  @Prop({
    type: 'string',
    required: true,
    default: () => crypto.randomBytes(32).toString('base64url'),
  })
  token: string;

  /** User session created from the IP address */
  @Prop({
    type: 'string',
    validate: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'should be a valid IPv4 address'],
  })
  ipAddr?: string;

  /** User session created from user agent */
  @Prop({
    type: 'string',
  })
  userAgent?: string;

  /** session last activity */
  @Prop({
    type: 'date',
    required: true,
    default: () => new Date(),
  })
  accessedAt: Date;

  /** session created at */
  createdAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
