/**
 * Importing npm packages
 */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Document, type Model, type Query, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { UserEmail, UserEmailSchema } from './schemas/user-email.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { defaultOptionsPlugin } from '../schema.utils';

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

interface UserStaticMethods {
  isNativeUser(user: User): user is NativeUser;
  isOAuthUser(user: User): user is OAuthUser;
}

export interface UserModel extends Omit<Model<User>, 'create' | 'insert' | 'insertMany'>, UserStaticMethods {}

export interface NativeUserModel extends Model<NativeUser>, UserStaticMethods {}

export interface OAuthUserModel extends Model<OAuthUser>, UserStaticMethods {}

/**
 * Declaring the constants
 */

@Schema({
  timestamps: true,
  versionKey: false,
  discriminatorKey: 'type',
})
export class User {
  static UserEmail = UserEmail;
  static UserSession = UserSession;

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
    minlength: [1, 'should have at least 1 email address'],
  })
  emails: UserEmail[];

  /** User's first name */
  @Prop({
    type: 'string',
    trim: true,
    required: [true, 'required'],
    minlength: [2, 'should have at least 3 characters'],
    maxlength: [32, 'should have at most 32 characters'],
    validate: [/^[a-zA-Z ]*$/, 'should only contain alphabets and spaces'],
  })
  firstName: string;

  /** User's last name */
  @Prop({
    type: 'string',
    trim: true,
    minlength: [1, 'should have at least 3 characters'],
    maxlength: [32, 'should have at most 32 characters'],
    validate: [/^[a-zA-Z ]*$/, 'should only contain alphabets and spaces'],
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

  /** Password reset code sent to the user to verify the password reset link. It is of the format '<expiry date in unix timestamp>|<base64 code>' */
  @Prop({
    type: 'string',
    select: false,
  })
  passwordResetCode?: string;
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

UserSchema.static('isNativeUser', (user: User) => 'password' in user);
UserSchema.static('isOAuthUser', (user: User) => 'refreshToken' in user);

/**
 * Setting up middlewares
 */
UserSchema.alias('_id', 'uid');
UserSchema.plugin(defaultOptionsPlugin);

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
