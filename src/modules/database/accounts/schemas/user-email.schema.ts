/**
 * Importing npm packages
 */
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
const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

@Schema({
  _id: false,
  versionKey: false,
})
export class UserEmail {
  static isEmail(email?: string): boolean {
    if (!email) return false;
    return emailRegex.test(email);
  }

  @Prop({
    type: 'string',
    trim: true,
    lowercase: true,
    required: [true, 'required'],
    validate: [emailRegex, 'should be an email'],
  })
  email: string;

  @Prop({
    type: 'boolean',
    required: true,
    default: false,
  })
  verified: boolean;

  @Prop({
    type: 'boolean',
  })
  primary?: boolean;
}

export const UserEmailSchema = SchemaFactory.createForClass(UserEmail);
