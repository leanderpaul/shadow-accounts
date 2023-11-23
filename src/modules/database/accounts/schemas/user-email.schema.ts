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
})
export class UserEmail {
  @Prop({
    type: 'string',
    trim: true,
    lowercase: true,
    required: [true, 'required'],
    validate: [/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, 'should be an email'],
  })
  email: string;

  @Prop({
    type: 'boolean',
    required: true,
    default: false,
  })
  verified: boolean;

  @Prop({
    type: 'string',
    default: (doc: UserEmail) => (doc.verified ? undefined : crypto.randomBytes(32).toString('base64url')),
  })
  verificationCode?: string;
}

export const UserEmailSchema = SchemaFactory.createForClass(UserEmail);
