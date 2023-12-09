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
    type: 'boolean',
  })
  primary?: boolean;
}

export const UserEmailSchema = SchemaFactory.createForClass(UserEmail);
