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
export class ServiceRole {
  /** Unique name of the user role */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [3, 'should have atleast 3 characters'],
    maxlength: [32, 'should have atmost 32 characters'],
    match: [/^[a-zA-Z]+$/, 'should only contain alphabets'],
    trim: true,
  })
  name: string;

  /** Description of the user role */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [3, 'should have atleast 3 characters'],
    maxlength: [32, 'should have atmost 32 characters'],
    trim: true,
  })
  description: string;
}

export const ServiceRoleSchema = SchemaFactory.createForClass(ServiceRole);
