/**
 * Importing npm packages
 */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Model, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { User } from './user.model';
import { defaultOptionsPlugin } from '../schema.utils';

/**
 * Defining types
 */

export interface AccountModel extends Model<Account> {}

/**
 * Declaring the constants
 */

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Account {
  static User = User;

  /** Account ID, alias of _id */
  aid: Types.ObjectId;

  /** Account name */
  @Prop({
    type: 'string',
    maxlength: [128, 'should have at most 128 characters'],
    minlength: [1, 'should have at least 1 character'],
  })
  accountName?: string;

  /** Denotes whether account is active or not */
  @Prop({
    type: 'string',
    required: true,
    default: true,
  })
  isEnabled: boolean;
}

/**
 * Creating the mongoose Schema
 */
const AccountSchema = SchemaFactory.createForClass(Account);

/**
 * Setting up middlewares
 */
AccountSchema.alias('_id', 'aid');
AccountSchema.plugin(defaultOptionsPlugin);

/**
 * Defining the indexes
 */

/**
 * Creating the mongoose module
 */
export const AccountMongooseModule = MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]);
