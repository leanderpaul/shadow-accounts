/**
 * Importing npm packages
 */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Model, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { defaultOptionsPlugin } from '../schema.utils';

/**
 * Defining types
 */

export type ServiceAccountModel = Model<ServiceAccount>;

/**
 * Declaring the constants
 */

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ServiceAccount {
  /** User ID to which this service account delongs to */
  @Prop({
    type: 'ObjectID',
    required: [true, 'required'],
  })
  uid: Types.ObjectId;

  /** App service name */
  @Prop({
    type: 'string',
    required: [true, 'required'],
  })
  service: string;

  /** User's role in this app service */
  @Prop({
    type: 'string',
    required: [true, 'required'],
  })
  role: string;

  /** User's status in this app service */
  @Prop({
    type: 'boolean',
    required: true,
    default: true,
  })
  active: boolean;
}

/**
 * Creating the mongoose Schema
 */
const ServiceAccountSchema = SchemaFactory.createForClass(ServiceAccount);

/**
 * Setting up middlewares
 */
ServiceAccountSchema.plugin(defaultOptionsPlugin);

/**
 * Setting up the indexes
 */
ServiceAccountSchema.index({ uid: 1, service: 1 }, { name: 'USER_SERVICE', background: true });

/**
 * Creating the mongoose module
 */
export const ServiceAccountMongooseModule = MongooseModule.forFeature([{ name: ServiceAccount.name, schema: ServiceAccountSchema }]);
