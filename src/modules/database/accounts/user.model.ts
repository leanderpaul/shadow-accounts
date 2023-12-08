/**
 * Importing npm packages
 */
import { type Projection } from '@leanderpaul/shadow-service';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import lodash from 'lodash';
import { type Document, type Model, type Query, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { IAMError, IAMErrorCode } from '@app/errors';

import { UserEmail, UserEmailSchema } from './schemas/user-email.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { defaultOptionsPlugin, handleDuplicateKeyError } from '../schema.utils';

/**
 * Defining types
 */

export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  CLOSED = 2,
}

export enum UserRole {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export enum Gender {
  MALE = 1,
  FEMAILE = 2,
}

export type UserInfo = Pick<User, 'aid' | 'uid' | 'type' | 'firstName' | 'lastName' | 'role' | 'status'>;

export interface UserModel extends Omit<Model<User>, 'create' | 'insert' | 'insertMany'> {}

export interface NativeUserModel extends Model<NativeUser> {}

export interface OAuthUserModel extends Model<OAuthUser> {}

/**
 * Declaring the constants
 */
const defaultUserProjection: Projection<User> = { aid: 1, uid: 1, firstName: 1, lastName: 1, role: 1, status: 1 };
const nameRegex = /^[a-zA-Z0-9 \-_.']+$/;
const nameRegexMessage = 'must contain only letters, numbers, spaces, and the following characters: -_.';

@Schema({
  id: false,
  timestamps: true,
  versionKey: false,
  discriminatorKey: 'type',
})
export class User {
  static UserEmail = UserEmail;
  static UserSession = UserSession;

  static Gender = Gender;
  static Status = UserStatus;
  static Role = UserRole;

  /** contructs user projection on top of the default user projection */
  static constructProjection(projection?: Projection<User | NativeUser | OAuthUser>): Projection<User | NativeUser | OAuthUser> {
    return lodash.defaultsDeep(defaultUserProjection, projection);
  }

  /** returns user info from user object by removing other fields */
  static getUserInfo = (user: User): UserInfo => lodash.pick(user, ['aid', 'uid', 'type', 'firstName', 'lastName', 'role', 'status']);

  /** Checks whether user is a native user */
  static isNativeUser = (user: User): user is NativeUser => 'password' in user;

  /** Checks whether user is an OAuth user */
  static isOAuthUser = (user: User): user is OAuthUser => 'refreshToken' in user;

  /** User ID, alias of _id */
  uid: Types.ObjectId;

  type: 'NativeUser' | 'OAuthUser';

  /** Account ID */
  @Prop({
    type: 'ObjectId',
    required: true,
  })
  aid: Types.ObjectId;

  /** User's email address */
  @Prop({
    type: [UserEmailSchema],
    required: [true, 'required'],
    validate: [(emails: UserEmail[]) => emails.length > 0, 'should have at least 1 email address'],
  })
  emails: UserEmail[];

  /** User's first name */
  @Prop({
    type: 'string',
    trim: true,
    required: [true, 'required'],
    minlength: [1, 'should have at least 1 character'],
    maxlength: [32, 'should have at most 32 characters'],
    match: [nameRegex, nameRegexMessage],
  })
  firstName: string;

  /** User's last name */
  @Prop({
    type: 'string',
    trim: true,
    minlength: [1, 'should have at least 1 character'],
    maxlength: [32, 'should have at most 32 characters'],
    match: [nameRegex, nameRegexMessage],
  })
  lastName?: string;

  /** User account status */
  @Prop({
    type: 'number',
    required: true,
    enum: Object.values(UserStatus).filter(v => typeof v === 'number'),
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  /** User role in the account */
  @Prop({
    type: 'number',
    required: true,
    enum: Object.values(UserRole).filter(v => typeof v === 'number'),
    default: UserRole.USER,
  })
  role: UserRole;

  /** URL containing the user's profile pic */
  @Prop({
    type: 'string',
    validate: [/^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i, 'should be a valid URI'],
  })
  imageUrl?: string;

  /** User's gender */
  @Prop({
    type: 'number',
    enum: Object.values(Gender).filter(v => typeof v === 'number'),
  })
  gender?: Gender;

  /** User's date of birth */
  @Prop({
    type: 'string',
    match: [/^\d{4}-\d{2}-\d{2}$/, 'should be a valid date in YYYY-MM-DD format'],
  })
  dob?: string;

  /** Array storing the session details of the user */
  @Prop({
    type: [UserSessionSchema],
    required: true,
  })
  sessions: UserSession[];

  /** Date the user account was created */
  createdAt: Date;

  /** Date the user account was last updated */
  updatedAt: Date;
}

@Schema()
export class NativeUser extends User {
  /** User's hashed password */
  @Prop({
    type: 'string',
    required: [true, 'requried'],
    select: false,
    validate: {
      msg: 'should have a minimum of 8 characters and have atleast one uppercase, lowercase, digit and, special character (#?!@$%^&*-)',
      validator: async function (this: Document<NativeUser> | Query<unknown, NativeUser>, password: string) {
        const isValid = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/.test(password);
        if (isValid) this.set('password', await Bun.password.hash(password));
        return isValid;
      },
    },
  })
  password: string;
}

@Schema()
export class OAuthUser extends User {
  /** Service provider's user id */
  @Prop({
    type: 'string',
    required: true,
    select: false,
  })
  spuid: string;

  /** Service Provider's hashed refresh token */
  @Prop({
    type: 'string',
    required: true,
    select: false,
  })
  refreshToken: string;
}

/**
 * Creating the mongoose Schema
 */
export const UserSchema = SchemaFactory.createForClass(User);
export const NativeUserSchema = SchemaFactory.createForClass(NativeUser);
export const OAuthUserSchema = SchemaFactory.createForClass(OAuthUser);

/**
 * Setting up middlewares
 */
UserSchema.alias('_id', 'uid');
UserSchema.plugin(defaultOptionsPlugin);
UserSchema.post('save', handleDuplicateKeyError(new IAMError(IAMErrorCode.U002)));

/**
 * Setting up the indexes
 */
UserSchema.index({ aid: 1, _id: 1 }, { name: 'ACCOUNT_ID', background: true });
UserSchema.index({ 'emails.email': 1 }, { name: 'UNIQUE_EMAIL', unique: true, background: true });

/**
 * Creating the mongoose module
 */
export const UserMongooseModule = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
    discriminators: [
      { name: NativeUser.name, schema: NativeUserSchema },
      { name: OAuthUser.name, schema: OAuthUserSchema },
    ],
  },
]);
