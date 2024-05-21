/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Document, type Model, type Query } from 'mongoose';

/**
 * Importing user defined packages
 */
import { ServiceRole } from './schemas/service-role.schema';
import { defaultOptionsPlugin } from '../schema.utils';

/**
 * Defining types
 */

export type AppServiceModel = Model<AppService>;

/**
 * Declaring the constants
 */
const alphanumerics = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class AppService {
  static Role = ServiceRole;

  static generateAccessToken(): string {
    let result = '';
    for (let index = 0; index < 32; index++) {
      const randomIndex = crypto.randomInt(0, 62);
      result += alphanumerics.charAt(randomIndex);
    }
    return result;
  }

  /** Unique name of the app service used to identify the service */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [3, 'should have atleast 3 characters'],
    maxlength: [32, 'should have atmost 32 characters'],
    match: [/^[a-zA-Z]+$/, 'should only contain alphabets'],
  })
  name: string;

  /** Display name of the app service */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [3, 'should have atleast 3 characters'],
    maxlength: [32, 'should have atmost 32 characters'],
    trim: true,
  })
  displayName: string;

  /** Description of the app service */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [1, 'should have atleast 1 characters'],
    maxlength: [256, 'should have atmost 256 characters'],
    trim: true,
  })
  description: string;

  /** sub domain in which the app service is hosted in */
  @Prop({
    type: 'string',
    required: [true, 'required'],
    minlength: [1, 'should have atleast 1 characters'],
    maxlength: [32, 'should have atmost 32 characters'],
    match: [/^[a-zA-Z0-9.]+$/, 'should only contain alphabets and numbers'],
    lowercase: true,
  })
  domain: string;

  /** home url in the app */
  @Prop({
    type: 'string',
    minlength: [1, 'should have atleast 3 characters'],
    maxlength: [256, 'should have atmost 256 characters'],
    trim: true,
  })
  homeUrl?: string;

  /** roles that the app service has */
  @Prop({
    type: [ServiceRole],
  })
  roles: ServiceRole[];

  /** whether the app service allows registration */
  @Prop({
    type: 'boolean',
    required: true,
    default: true,
  })
  allowRegistration: boolean;

  /** app service access token */
  @Prop({
    type: 'string',
    required: true,
    validate: {
      msg: 'invalid access token',
      validator: async function (this: Document<AppService> | Query<unknown, AppService>, accessToken: string) {
        const isValid = /^[a-zA-Z0-9]{32}$/.test(accessToken);
        if (isValid) this.set('accessToken', await Bun.password.hash(accessToken));
        return isValid;
      },
    },
  })
  accessToken: string;

  /** whether the app service is active */
  @Prop({
    type: 'boolean',
    required: true,
    default: true,
  })
  active: boolean;

  /** Date the app service was created */
  createdAt: Date;

  /** Date the app service was updated */
  updatedAt: Date;
}

/**
 * Creating the mongoose Schema
 */
export const AppServiceSchema = SchemaFactory.createForClass(AppService);

/**
 * Setting up middlewares
 */
AppServiceSchema.plugin(defaultOptionsPlugin);

/**
 * Setting up the indexes
 */
AppServiceSchema.index({ name: 1 }, { unique: true });

/**
 * Creating the mongoose module
 */
export const AppServiceMongooseModule = MongooseModule.forFeature([{ name: AppService.name, schema: AppServiceSchema }]);
